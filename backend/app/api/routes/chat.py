"""POST /api/chat/{report_id} — RAG-powered company chatbot."""
from __future__ import annotations

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.logging import get_logger
from app.db.job_store import job_store
from app.models.schemas import (
    ChatMessage,
    ChatRequest,
    ChatSession,
    SourceRef,
)
from app.services.ai.multi_llm import multi_llm_invoke

router = APIRouter(tags=["chat"])
logger = get_logger(__name__)

# In-memory session store (we'll keep sessions in memory for now)
_sessions: dict[str, ChatSession] = {}


@router.post("/chat/global")
async def global_chat(req: ChatRequest) -> dict:
    """Answer a general question without a specific company report context."""
    session_id = req.session_id or "global"
    if session_id not in _sessions:
        _sessions[session_id] = ChatSession(
            id=session_id,
            report_id="global",
            company_name="Global Assistant",
        )
    session = _sessions[session_id]
    
    # Build conversation history
    history = ""
    for msg in session.messages[-6:]:
        role = "User" if msg.role == "user" else "Assistant"
        history += f"\n{role}: {msg.content}"

    system_prompt = f"""You are the Nexora AI Global Assistant. 
You are an expert on business strategy, market trends, and competitive analysis.
Answer the user's question directly and professionally.

Conversation History:
{history if history else '(none)'}"""

    try:
        logger.info("🤖 Global Chat: Generating answer...")
        answer, model_used = await multi_llm_invoke(system_prompt, req.message, role="polisher", temperature=0.0)
    except Exception as exc:
        logger.error("Global Chat failed: %s", exc)
        raise HTTPException(500, f"AI chat failed: {exc}") from exc

    user_msg = ChatMessage(role="user", content=req.message)
    assistant_msg = ChatMessage(role="assistant", content=answer, sources=[], model_used=model_used)
    session.messages.extend([user_msg, assistant_msg])

    return {
        "session_id": session_id,
        "answer": answer,
        "sources": [],
        "message_count": len(session.messages),
        "model_used": model_used,
    }

@router.post("/chat/{report_id}")
async def chat(report_id: str, req: ChatRequest) -> dict:
    """Answer a question about a company using RAG."""
    report = await job_store.get_report_async(report_id)
    if not report:
        raise HTTPException(404, "Report not found. Generate a report first.")

    # Get or create session
    session_id = req.session_id or report_id
    if session_id not in _sessions:
        _sessions[session_id] = ChatSession(
            id=session_id,
            report_id=report_id,
            company_name=report.company_name,
        )
    session = _sessions[session_id]

    # Search knowledge base (using ChromaDB through rag_engine)
    from app.services.ai.rag_engine import search_knowledge_base
    relevant_docs = search_knowledge_base(report_id, req.message, n_results=5)

    # Build context from retrieved docs
    context_parts: list[str] = []
    source_refs: list[SourceRef] = []

    if relevant_docs:
        context_parts.append("=== Relevant Information ===")
        for doc in relevant_docs:
            context_parts.append(f"\nFrom {doc['title']} ({doc['url']}):\n{doc['text']}")
            if doc.get("url"):
                source_refs.append(
                    SourceRef(
                        source=doc.get("source", "web"),
                        url=doc["url"],
                        confidence="medium",  # type: ignore[arg-type]
                    )
                )

    # Also add key report sections as context
    if report.overview.description:
        context_parts.append(f"\n=== Company Overview ===\n{report.overview.description}")
    if report.ai_summary.executive_summary:
        context_parts.append(f"\n=== Executive Summary ===\n{report.ai_summary.executive_summary}")

    # Build conversation history
    history = ""
    for msg in session.messages[-6:]:  # last 3 turns
        role = "User" if msg.role == "user" else "Assistant"
        history += f"\n{role}: {msg.content}"

    full_context = "\n".join(context_parts)

    # ── Multi-Agent Team Configuration ──
    analyst_prompt = f"""You are a helpful, conversational AI Assistant and Research Analyst specializing in {report.company_name}.
Your job is to answer the user's questions based on the context and history.
If they ask about {report.company_name} or related business topics, use the provided context to give detailed, data-rich answers.
If they are just chatting normally, respond in a friendly conversational manner.
CRITICAL RULE: For factual claims about the company, rely on the retrieved context. Do not invent financial numbers or data."""

    critic_prompt = f"""You are the QC Fact Checker and Critic.
Review the Lead Analyst's draft. Check it strictly against the retrieved context.
Point out:
1. Any unsupported claims, fabricated numbers, or hallucinations.
2. Important missing context/details.
3. Logical flow or tone issues.
Be concise but thorough."""

    polisher_prompt = f"""You are the Editor in Chief.
Synthesize the Analyst's draft and the Critic's feedback into the final response for the user.
Ensure any factual claims are verified by the context. If the user is just having a normal conversation, keep the tone friendly and helpful.
Only return the final polished answer in markdown."""

    user_prompt = f"""Context:
{full_context}

Conversation History:
{history if history else '(none)'}

User Question: {req.message}"""

    try:
        logger.info("🤖 Multi-Agent Chat: Analyst generating draft...")
        draft, _ = await multi_llm_invoke(analyst_prompt, user_prompt, role="analyst", temperature=0.0)
        
        logger.info("🕵️ Multi-Agent Chat: Critic reviewing draft...")
        critic_input = f"Context:\n{full_context}\n\nDraft:\n{draft}\n\nUser Question: {req.message}"
        review, _ = await multi_llm_invoke(critic_prompt, critic_input, role="critic", temperature=0.0)
        
        logger.info("✍️ Multi-Agent Chat: Polisher generating final answer...")
        polisher_input = f"Draft:\n{draft}\n\nCritic Feedback:\n{review}\n\nUser Question: {req.message}"
        answer, model_used = await multi_llm_invoke(polisher_prompt, polisher_input, role="polisher", temperature=0.0)
    except Exception as exc:
        logger.error("Chat multi-agent flow failed: %s", exc)
        raise HTTPException(500, f"AI chat failed: {exc}") from exc

    # Store in session
    user_msg = ChatMessage(role="user", content=req.message)
    assistant_msg = ChatMessage(role="assistant", content=answer, sources=source_refs, model_used=model_used)
    session.messages.extend([user_msg, assistant_msg])

    return {
        "session_id": session_id,
        "answer": answer,
        "sources": [s.model_dump() for s in source_refs],
        "message_count": len(session.messages),
        "model_used": model_used,
    }


@router.get("/chat/{report_id}/history")
async def get_chat_history(report_id: str, session_id: str | None = None) -> dict:
    """Get conversation history for a session."""
    sid = session_id or report_id
    session = _sessions.get(sid)
    if not session:
        return {"session_id": sid, "messages": [], "message_count": 0}
    return {
        "session_id": sid,
        "company_name": session.company_name,
        "messages": [m.model_dump() for m in session.messages],
        "message_count": len(session.messages),
    }


@router.delete("/chat/{report_id}/history")
async def clear_chat_history(report_id: str) -> dict:
    """Clear conversation history."""
    _sessions.pop(report_id, None)
    return {"status": "cleared"}
