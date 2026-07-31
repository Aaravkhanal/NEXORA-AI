"""Async web crawler with robots.txt compliance and content deduplication."""
from __future__ import annotations

import asyncio
import re
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup

from app.core.config import settings
from app.core.logging import get_logger
from app.services.crawlers.content_extractor import extract_text

logger = get_logger(__name__)

_PRIORITY_PATHS = [
    "/about", "/about-us", "/company", "/who-we-are",
    "/products", "/services", "/solutions",
    "/pricing",
    "/careers", "/jobs",
    "/blog", "/news", "/press",
    "/investors", "/investor-relations",
    "/docs", "/documentation",
    "/contact",
    "/",
]

_SKIP_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
                    ".css", ".js", ".xml", ".zip", ".tar", ".gz"}


def _normalize_url(url: str, base: str) -> str | None:
    try:
        full = urljoin(base, url)
        parsed = urlparse(full)
        if parsed.scheme not in ("http", "https"):
            return None
        # Strip fragment and tracking params
        clean = parsed._replace(fragment="", query="").geturl()
        return clean
    except Exception:
        return None


def _is_skip_url(url: str) -> bool:
    parsed = urlparse(url)
    path = parsed.path.lower()
    return any(path.endswith(ext) for ext in _SKIP_EXTENSIONS)


async def _check_robots(base_url: str, client: httpx.AsyncClient) -> RobotFileParser:
    rp = RobotFileParser()
    rp.set_url(urljoin(base_url, "/robots.txt"))
    try:
        resp = await client.get(rp.url, timeout=10)  # type: ignore[arg-type]
        rp.parse(resp.text.splitlines())
    except Exception:
        pass  # If robots.txt unavailable, allow crawl
    return rp


async def _fetch_page(url: str, client: httpx.AsyncClient) -> str | None:
    try:
        resp = await client.get(
            url,
            timeout=settings.request_timeout,
            follow_redirects=True,
        )
        resp.raise_for_status()
        ct = resp.headers.get("content-type", "")
        if "text/html" not in ct:
            return None
        return resp.text
    except Exception as exc:
        logger.debug("Failed to fetch %s: %s", url, exc)
        return None


def _extract_links(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    links: list[str] = []
    for tag in soup.find_all("a", href=True):
        normalized = _normalize_url(tag["href"], base_url)
        if normalized and not _is_skip_url(normalized):
            links.append(normalized)
    return links


def _same_domain(url: str, base: str) -> bool:
    try:
        return urlparse(url).netloc == urlparse(base).netloc
    except Exception:
        return False


async def crawl_website(
    base_url: str,
    max_pages: int | None = None,
) -> list[dict[str, str]]:
    """
    Crawl a website and return list of {url, title, text} dicts.
    Prioritises important pages (about, products, pricing, etc.)
    """
    if max_pages is None:
        max_pages = settings.max_crawl_pages

    if not base_url.startswith("http"):
        base_url = f"https://{base_url}"

    parsed = urlparse(base_url)
    root = f"{parsed.scheme}://{parsed.netloc}"

    # Build prioritized URL queue
    priority_queue = [urljoin(root, p) for p in _PRIORITY_PATHS]
    visited: set[str] = set()
    results: list[dict[str, str]] = []

    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; NexusBot/1.0; +https://nexus-intelligence.ai/bot)",
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
        robots = await _check_robots(root, client)

        async def process_url(url: str) -> None:
            if url in visited or len(results) >= max_pages:  # type: ignore[operator]
                return
            if _is_skip_url(url):
                return
            if not robots.can_fetch("*", url):
                logger.debug("robots.txt blocked: %s", url)
                return

            visited.add(url)
            html = await _fetch_page(url, client)
            if not html:
                return

            text, title = extract_text(html)
            if len(text.strip()) > 100:
                results.append({"url": url, "title": title, "text": text})
                logger.debug("Crawled: %s (%d chars)", url, len(text))

            # Queue discovered links from the same domain
            if len(results) < max_pages:  # type: ignore[operator]
                for link in _extract_links(html, url):
                    if _same_domain(link, root) and link not in visited:
                        priority_queue.append(link)

        # Process prioritized pages first
        for url in list(priority_queue[:max_pages]):  # type: ignore[index]
            if len(results) >= max_pages:  # type: ignore[operator]
                break
            await process_url(url)
            await asyncio.sleep(0.3)  # polite crawl delay

    logger.info("Crawled %d pages from %s", len(results), root)
    return results
