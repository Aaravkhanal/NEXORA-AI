"""
Multi-LLM Router — Supports Gemini, NVIDIA (OpenAI-compatible), Groq, OpenRouter, Ollama.

Priority chain: Gemini → NVIDIA Gemma → NVIDIA GLM → Groq → fallback
Each agent in the chat pipeline can be assigned a different model for diversity.

FIXES:
- Updated Groq model from decommissioned llama-3.1-70b-versatile to llama-3.3-70b-versatile
- Added global semaphore to cap concurrent API calls (avoids 429 rate limits)
- Added per-call asyncio timeout (90s) to prevent hanging forever
- Added jitter on retry backoff
"""
from __future__ import annotations

import asyncio
import random
from enum import Enum
from typing import Any

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Global semaphore — cap total concurrent LLM calls across all pipeline stages
# This prevents 429 rate limits on shared API quotas
_LLM_SEMAPHORE = asyncio.Semaphore(4)


class LLMProvider(str, Enum):
    GEMINI = "gemini"
    NVIDIA_GEMMA = "nvidia_gemma"
    NVIDIA_GLM = "nvidia_glm"
    GROQ = "groq"
    OPENROUTER = "openrouter"
    OLLAMA = "ollama"
    OPENAI = "openai"


# ── Model registry ────────────────────────────────────────────────────────────

def _make_gemini(temperature: float = 0.2) -> BaseChatModel | None:
    if not settings.gemini_api_key:
        return None
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.gemini_api_key,
            temperature=temperature,
            convert_system_message_to_human=True,
            max_retries=0,  # We handle retries ourselves to avoid 32s hangs
        )
    except Exception as e:
        logger.warning("Gemini init failed: %s", e)
        return None


def _make_nvidia(model_name: str, temperature: float = 0.2) -> BaseChatModel | None:
    if not settings.openai_api_key:
        return None
    if "nvidia.com" not in settings.openai_api_base:
        return None
    try:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=model_name,
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
            temperature=temperature,
            max_tokens=4096,
        )
    except Exception as e:
        logger.warning("NVIDIA %s init failed: %s", model_name, e)
        return None


def _make_groq(temperature: float = 0.2) -> BaseChatModel | None:
    if not settings.groq_api_key:
        return None
    try:
        from langchain_groq import ChatGroq
        return ChatGroq(
            # FIX: llama-3.1-70b-versatile was decommissioned; use the current model
            model="llama-3.3-70b-versatile",
            api_key=settings.groq_api_key,
            temperature=temperature,
            max_tokens=4096,
        )
    except Exception as e:
        logger.warning("Groq init failed: %s", e)
        return None


def _make_openrouter(temperature: float = 0.2) -> BaseChatModel | None:
    if not settings.openrouter_api_key:
        return None
    try:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model="anthropic/claude-3-haiku",
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
            temperature=temperature,
        )
    except Exception as e:
        logger.warning("OpenRouter init failed: %s", e)
        return None


def _make_ollama(temperature: float = 0.2) -> BaseChatModel | None:
    if not settings.ollama_base_url:
        return None
    try:
        from langchain_community.chat_models import ChatOllama
        return ChatOllama(
            model=settings.ollama_model or "llama3.1",
            base_url=settings.ollama_base_url,
            temperature=temperature,
        )
    except Exception as e:
        logger.warning("Ollama init failed: %s", e)
        return None


# ── Priority chain ─────────────────────────────────────────────────────────────

def get_priority_chain(temperature: float = 0.2) -> list[tuple[str, BaseChatModel]]:
    """Return ordered list of (name, model) that are currently configured."""
    candidates = [
        ("gemini", _make_gemini(temperature)),
        ("nvidia_gemma", _make_nvidia("google/gemma-4-31b-it", temperature)),
        ("nvidia_glm", _make_nvidia("z-ai/glm-5.2", temperature)),
        ("groq", _make_groq(temperature)),
        ("openrouter", _make_openrouter(temperature)),
        ("ollama", _make_ollama(temperature)),
    ]
    chain = [(name, model) for name, model in candidates if model is not None]
    if not chain:
        raise RuntimeError(
            "No LLM providers configured. Set at least one of: "
            "GEMINI_API_KEY, OPENAI_API_KEY (NVIDIA), GROQ_API_KEY, "
            "OPENROUTER_API_KEY, or OLLAMA_BASE_URL in your .env file."
        )
    logger.debug("LLM chain: %s", [name for name, _ in chain])
    return chain


def get_model_by_role(role: str = "default", temperature: float = 0.2) -> tuple[str, BaseChatModel]:
    """
    Return the best model for a specific role in the multi-agent pipeline.
    
    Roles:
    - analyst: Best model for deep analysis (prefers Gemini)
    - critic: Fast model for fact-checking (prefers GLM or Groq)
    - polisher: Balanced model (prefers Gemma or Gemini)
    - embedding: Used for RAG only (not returned here)
    - default: First available model
    """
    chain = get_priority_chain(temperature)
    name_to_model = dict(chain)
    
    role_preference = {
        "analyst": ["nvidia_gemma", "groq", "gemini", "nvidia_glm", "openrouter", "ollama"],
        "critic":  ["nvidia_gemma", "groq", "nvidia_glm", "gemini", "openrouter", "ollama"],
        "polisher": ["nvidia_gemma", "groq", "gemini", "nvidia_glm", "openrouter", "ollama"],
        "default": ["nvidia_gemma", "groq", "gemini", "nvidia_glm", "openrouter", "ollama"],
    }
    
    for preferred in role_preference.get(role, role_preference["default"]):
        if preferred in name_to_model:
            return preferred, name_to_model[preferred]
    
    return chain[0]  # Absolute fallback


# ── Core invoke with fallback ──────────────────────────────────────────────────

async def multi_llm_invoke(
    system_prompt: str,
    user_prompt: str,
    role: str = "default",
    temperature: float = 0.2,
    retries: int = 2,
    call_timeout: float = 90.0,
) -> tuple[str, str]:
    """
    Invoke LLM with role-based routing and automatic fallback chain.
    Uses global semaphore to limit concurrent calls and avoid 429 rate limits.
    
    Returns (response_text, model_name_used).
    """
    chain = get_priority_chain(temperature)
    name_to_model = dict(chain)

    # Role-based preferred model first
    role_preferences = {
        "analyst": ["nvidia_gemma", "groq", "gemini", "nvidia_glm", "openrouter", "ollama"],
        "critic":  ["nvidia_gemma", "groq", "nvidia_glm", "gemini", "openrouter", "ollama"],
        "polisher": ["nvidia_gemma", "groq", "gemini", "nvidia_glm", "openrouter", "ollama"],
        "default": ["nvidia_gemma", "groq", "gemini", "nvidia_glm", "openrouter", "ollama"],
    }
    
    ordered_names = role_preferences.get(role, role_preferences["default"])
    available_names = [n for n in ordered_names if n in name_to_model]
    remaining = [n for n, _ in chain if n not in available_names]
    ordered_models = [(n, name_to_model[n]) for n in (available_names + remaining)]
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]
    
    last_error: Exception | None = None
    for attempt_name, model in ordered_models:
        for attempt in range(retries):
            try:
                logger.debug("Trying %s (attempt %d, role=%s)", attempt_name, attempt + 1, role)
                # Acquire semaphore to cap concurrent calls
                async with _LLM_SEMAPHORE:
                    result = await asyncio.wait_for(
                        model.ainvoke(messages),
                        timeout=call_timeout,
                    )
                text = str(result.content).strip()
                if text:
                    if attempt_name != (ordered_models[0][0] if ordered_models else ""):
                        logger.info("Fell back to %s for role=%s", attempt_name, role)
                    return text, attempt_name
            except asyncio.TimeoutError:
                last_error = TimeoutError(f"LLM call to {attempt_name} timed out after {call_timeout}s")
                logger.warning("LLM %s timed out (attempt %d)", attempt_name, attempt + 1)
            except Exception as e:
                last_error = e
                # Check if it's a decommissioned/permanent error — don't retry
                err_str = str(e).lower()
                if "decommissioned" in err_str or "model_not_found" in err_str:
                    logger.error("LLM %s permanently unavailable: %s", attempt_name, e)
                    break  # Try next model immediately
                logger.warning("LLM %s failed (attempt %d): %s", attempt_name, attempt + 1, e)
                if attempt < retries - 1:
                    # Exponential backoff with jitter
                    wait = (1.0 * (attempt + 1)) + random.uniform(0, 0.5)
                    await asyncio.sleep(wait)
    
    raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")


async def consensus_invoke(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.3,
) -> str:
    """
    Query 2 different models in parallel, then use the best model to merge.
    Used for high-stakes sections where accuracy matters most.
    """
    chain = get_priority_chain(temperature)
    if len(chain) < 2:
        # Only one model available — just use it directly
        text, _ = await multi_llm_invoke(system_prompt, user_prompt, temperature=temperature)
        return text

    # Pick 2 different models
    model_a_name, model_a = chain[0]
    model_b_name, model_b = chain[1]
    
    messages = [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)]
    
    try:
        results = await asyncio.gather(
            asyncio.wait_for(model_a.ainvoke(messages), timeout=90.0),
            asyncio.wait_for(model_b.ainvoke(messages), timeout=90.0),
            return_exceptions=True,
        )
        
        answers = []
        for i, result in enumerate(results):
            if not isinstance(result, Exception):
                answers.append((chain[i][0], str(result.content).strip()))
        
        if not answers:
            raise RuntimeError("Both consensus models failed")
        
        if len(answers) == 1:
            return answers[0][1]
        
        # Merge with synthesizer
        merge_prompt = f"""Two AI analysts independently answered the same question.
Synthesize their answers into one definitive, accurate, well-structured response.
Remove contradictions. Keep the best insights from both. Be factual.

Answer from {answers[0][0]}:
{answers[0][1]}

Answer from {answers[1][0]}:
{answers[1][1]}

Original question:
{user_prompt}

Synthesized answer (output only the final answer, no preamble):"""

        merged, _ = await multi_llm_invoke(
            "You are an expert editor synthesizing research reports.",
            merge_prompt,
            role="polisher",
        )
        return merged
        
    except Exception as e:
        logger.error("Consensus invoke failed: %s", e)
        text, _ = await multi_llm_invoke(system_prompt, user_prompt)
        return text


# ── Embeddings ─────────────────────────────────────────────────────────────────

_embeddings_singleton: Any = None

def get_embeddings() -> Any:
    """Return embedding model, with fallback chain."""
    global _embeddings_singleton
    if _embeddings_singleton is not None:
        return _embeddings_singleton

    if settings.gemini_api_key:
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            _embeddings_singleton = GoogleGenerativeAIEmbeddings(
                model=settings.embedding_model,
                google_api_key=settings.gemini_api_key,
                max_retries=0,
            )
            logger.info("Using Gemini embeddings (%s)", settings.embedding_model)
            return _embeddings_singleton
        except Exception as e:
            logger.warning("Gemini embeddings failed: %s", e)

    if settings.openai_api_key:
        try:
            from langchain_openai import OpenAIEmbeddings
            _embeddings_singleton = OpenAIEmbeddings(
                api_key=settings.openai_api_key,
                base_url=settings.openai_api_base,
                model=settings.openai_embedding_model,
            )
            logger.info("Using NVIDIA/OpenAI embeddings")
            return _embeddings_singleton
        except Exception as e:
            logger.warning("NVIDIA embeddings failed: %s", e)

    raise RuntimeError("No embedding provider configured.")
