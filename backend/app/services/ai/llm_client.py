"""
llm_client.py — Thin shim that delegates to multi_llm.py.
Kept for backwards compatibility with existing callers.
"""
from __future__ import annotations

from app.services.ai.multi_llm import get_embeddings, multi_llm_invoke

__all__ = ["llm_invoke", "get_embeddings"]


async def llm_invoke(system_prompt: str, user_prompt: str, role: str = "default") -> str:
    """Simple helper — returns text. Delegates to multi-LLM router with fallback."""
    text, _ = await multi_llm_invoke(system_prompt, user_prompt, role=role)
    return text
