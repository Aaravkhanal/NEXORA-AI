"""News retriever using NewsAPI and RSS feeds."""
from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any

import feedparser
import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

NEWSAPI_URL = "https://newsapi.org/v2/everything"

# Free RSS feeds (no API key needed)
RSS_TEMPLATES = [
    "https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en",
    "https://feeds.finance.yahoo.com/rss/2.0/headline?s={query}&region=US&lang=en-US",
]


async def _fetch_newsapi(company_name: str, client: httpx.AsyncClient) -> list[dict[str, Any]]:
    if not settings.news_api_key:
        return []
    try:
        resp = await client.get(
            NEWSAPI_URL,
            params={
                "q": f'"{company_name}"',
                "sortBy": "publishedAt",
                "pageSize": 10,
                "language": "en",
                "apiKey": settings.news_api_key,
            },
            timeout=settings.request_timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        articles = data.get("articles", [])
        return [
            {
                "title": a.get("title", ""),
                "url": a.get("url", ""),
                "source": a.get("source", {}).get("name"),
                "published_at": a.get("publishedAt"),
                "summary": a.get("description") or a.get("content", "")[:200],
            }
            for a in articles
        ]
    except Exception as exc:
        logger.debug("NewsAPI failed: %s", exc)
        return []


async def _fetch_rss(company_name: str) -> list[dict[str, Any]]:
    """Fetch from Google News RSS (no API key needed)."""
    results: list[dict[str, Any]] = []
    query = company_name.replace(" ", "+")

    for template in RSS_TEMPLATES:
        url = template.format(query=query)
        try:
            loop = asyncio.get_event_loop()
            feed = await loop.run_in_executor(None, feedparser.parse, url)
            for entry in feed.entries[:5]:
                results.append({
                    "title": getattr(entry, "title", ""),
                    "url": getattr(entry, "link", ""),
                    "source": getattr(entry, "source", {}).get("title") if hasattr(entry, "source") else None,
                    "published_at": getattr(entry, "published", None),
                    "summary": getattr(entry, "summary", "")[:200],
                })
        except Exception as exc:
            logger.debug("RSS fetch failed (%s): %s", url, exc)

    return results


def _deduplicate(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen_urls: set[str] = set()
    unique: list[dict[str, Any]] = []
    for item in items:
        url = item.get("url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique.append(item)
    return unique[:15]


async def retrieve_news(company_name: str) -> list[dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        api_news, rss_news = await asyncio.gather(
            _fetch_newsapi(company_name, client),
            _fetch_rss(company_name),
        )

    all_news = _deduplicate(api_news + rss_news)
    logger.info("Retrieved %d news articles for '%s'", len(all_news), company_name)
    return all_news
