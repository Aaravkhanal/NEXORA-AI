"""Wikipedia retriever — refactored from original codebase."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any

import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

WIKIPEDIA_API = "https://en.wikipedia.org/api/rest_v1"
WIKIPEDIA_OPENSEARCH = "https://en.wikipedia.org/w/api.php"
_USER_AGENT = "NexusIntelligence/1.0 (company-research-bot; contact@nexus-intelligence.ai)"


async def _search_title(query: str, client: httpx.AsyncClient) -> str:
    resp = await client.get(
        WIKIPEDIA_OPENSEARCH,
        params={"action": "opensearch", "search": query, "limit": 3, "namespace": 0, "format": "json"},
        timeout=settings.request_timeout,
    )
    resp.raise_for_status()
    data = resp.json()
    titles: list[str] = data[1]
    if not titles:
        raise ValueError(f"No Wikipedia page found for '{query}'")
    return titles[0]


async def _fetch_summary(title: str, client: httpx.AsyncClient) -> dict[str, Any]:
    resp = await client.get(
        f"{WIKIPEDIA_API}/page/summary/{title}",
        timeout=settings.request_timeout,
    )
    resp.raise_for_status()
    return resp.json()  # type: ignore[no-any-return]


async def _fetch_sections(title: str, client: httpx.AsyncClient) -> str:
    """Fetch the full text of relevant Wikipedia sections."""
    resp = await client.get(
        WIKIPEDIA_OPENSEARCH,
        params={
            "action": "query",
            "titles": title,
            "prop": "extracts",
            "exintro": False,
            "explaintext": True,
            "format": "json",
        },
        timeout=settings.request_timeout,
    )
    resp.raise_for_status()
    data = resp.json()
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        return page.get("extract", "")  # type: ignore[return-value]
    return ""


async def retrieve_wikipedia(company_name: str) -> dict[str, Any]:
    """
    Returns structured Wikipedia data including title, summary, full text, and URL.
    """
    headers = {"User-Agent": _USER_AGENT}
    async with httpx.AsyncClient(headers=headers) as client:
        try:
            title = await _search_title(company_name, client)
            summary_data = await _fetch_summary(title, client)
            full_text = await _fetch_sections(title, client)
        except Exception as exc:
            logger.warning("Wikipedia retrieval failed for '%s': %s", company_name, exc)
            return {"error": str(exc)}

    return {
        "source": "wikipedia",
        "title": summary_data.get("title", title),
        "summary": summary_data.get("extract", ""),
        "full_text": full_text[:15000],  # limit for context window
        "url": summary_data.get("content_urls", {}).get("desktop", {}).get("page", ""),
        "thumbnail": summary_data.get("thumbnail", {}).get("source"),
        "description": summary_data.get("description", ""),
        "retrieved_at": datetime.now().isoformat(),
    }
