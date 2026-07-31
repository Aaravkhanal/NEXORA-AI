"""
Reddit retriever — uses Reddit's public JSON API (free, no key needed).
"""
from __future__ import annotations

import httpx

from app.core.logging import get_logger

logger = get_logger(__name__)

HEADERS = {
    "User-Agent": "NexusIntelligence/1.0 CompanyResearchBot",
    "Accept": "application/json",
}


async def retrieve_reddit(company_name: str, max_results: int = 10) -> dict:
    """Search Reddit for discussions about a company."""
    try:
        async with httpx.AsyncClient(timeout=15, headers=HEADERS, follow_redirects=True) as client:
            # Search across all of Reddit
            search_url = "https://www.reddit.com/search.json"
            params = {
                "q": f'"{company_name}"',
                "sort": "relevance",
                "t": "year",
                "limit": max_results,
                "type": "link",
            }
            resp = await client.get(search_url, params=params)
            resp.raise_for_status()
            data = resp.json()

        posts = data.get("data", {}).get("children", [])
        results = []
        for post in posts:
            p = post.get("data", {})
            results.append({
                "title": p.get("title", ""),
                "url": f"https://www.reddit.com{p.get('permalink', '')}",
                "external_url": p.get("url", ""),
                "subreddit": p.get("subreddit", ""),
                "score": p.get("score", 0),
                "num_comments": p.get("num_comments", 0),
                "selftext": (p.get("selftext") or "")[:500],
                "created_utc": p.get("created_utc", 0),
                "author": p.get("author", ""),
                "upvote_ratio": p.get("upvote_ratio", 0),
            })

        logger.info("Retrieved %d Reddit posts for '%s'", len(results), company_name)

        # Also find relevant subreddits
        subreddits = list({r["subreddit"] for r in results if r["subreddit"]})[:5]

        return {
            "results": results,
            "relevant_subreddits": subreddits,
            "total_found": len(results),
        }

    except Exception as exc:
        logger.warning("Reddit retrieval failed for '%s': %s", company_name, exc)
        return {"results": [], "relevant_subreddits": [], "total_found": 0, "error": str(exc)}
