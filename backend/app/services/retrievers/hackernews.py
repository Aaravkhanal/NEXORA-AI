"""
Hacker News retriever — uses Algolia HN Search API (free, no key needed).
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta

import httpx

from app.core.logging import get_logger

logger = get_logger(__name__)

HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search"


async def retrieve_hackernews(company_name: str, max_results: int = 10) -> dict:
    """Search Hacker News for discussions about a company."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Get recent discussions (last 2 years)
            cutoff = int((datetime.now() - timedelta(days=730)).timestamp())
            params = {
                "query": company_name,
                "tags": "(story,comment)",
                "numericFilters": f"created_at_i>{cutoff}",
                "hitsPerPage": max_results,
            }
            resp = await client.get(HN_SEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        hits = data.get("hits", [])
        results = []
        for hit in hits:
            results.append({
                "title": hit.get("title") or hit.get("comment_text", "")[:100],
                "url": hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                "hn_url": f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                "points": hit.get("points", 0),
                "num_comments": hit.get("num_comments", 0),
                "author": hit.get("author", ""),
                "created_at": hit.get("created_at", ""),
                "text": (hit.get("story_text") or hit.get("comment_text") or "")[:500],
            })

        logger.info("Retrieved %d HN results for '%s'", len(results), company_name)
        return {
            "results": results,
            "total": data.get("nbHits", 0),
            "sentiment_summary": _summarize_hn_sentiment(results),
        }

    except Exception as exc:
        logger.warning("HackerNews retrieval failed for '%s': %s", company_name, exc)
        return {"results": [], "total": 0, "error": str(exc)}


def _summarize_hn_sentiment(results: list[dict]) -> str:
    """Simple keyword-based sentiment summary from HN discussions."""
    if not results:
        return "No HN discussions found."
    total_points = sum(r.get("points", 0) for r in results)
    avg_comments = sum(r.get("num_comments", 0) for r in results) / len(results)
    return (
        f"{len(results)} discussions found. "
        f"Total points: {total_points}. "
        f"Average comments per thread: {avg_comments:.0f}."
    )
