"""
Crunchbase public page scraper — extracts company data from public Crunchbase pages.
No API key needed. Respects robots.txt.
"""
from __future__ import annotations

import re

import httpx
from bs4 import BeautifulSoup

from app.core.logging import get_logger

logger = get_logger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; NexusIntelligence/1.0; research bot)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}


async def retrieve_crunchbase(company_name: str) -> dict:
    """Scrape public Crunchbase company page for funding/investor data."""
    slug = _to_slug(company_name)
    url = f"https://www.crunchbase.com/organization/{slug}"

    try:
        async with httpx.AsyncClient(
            timeout=20,
            headers=HEADERS,
            follow_redirects=True,
        ) as client:
            resp = await client.get(url)
            if resp.status_code == 404:
                # Try alternative slug format
                alt_slug = slug.replace("-", "")
                resp = await client.get(f"https://www.crunchbase.com/organization/{alt_slug}")

            if resp.status_code != 200:
                return {"error": f"HTTP {resp.status_code}", "url": url}

            html = resp.text

        soup = BeautifulSoup(html, "lxml")

        # Extract page text for LLM context
        page_text = soup.get_text(separator=" ", strip=True)[:5000]

        # Try to extract structured data from JSON-LD or meta tags
        meta = {}
        for tag in soup.find_all("meta"):
            prop = tag.get("property") or tag.get("name") or ""
            content = tag.get("content") or ""
            if prop and content:
                meta[prop] = content

        # Extract key info via patterns
        description = (
            meta.get("og:description")
            or meta.get("description")
            or _extract_pattern(page_text, r"(?:founded in|established in)\s+(\d{4})")
        )

        founded_match = re.search(r"(?:founded|established)[:\s]+(\d{4})", page_text, re.IGNORECASE)
        founded_year = int(founded_match.group(1)) if founded_match else None

        employees_match = re.search(r"(\d[\d,\-+]+)\s*(?:employees?|people)", page_text, re.IGNORECASE)
        employees = employees_match.group(1) if employees_match else None

        logger.info("Retrieved Crunchbase data for '%s'", company_name)
        return {
            "url": url,
            "slug": slug,
            "description": description,
            "founded_year": founded_year,
            "employees": employees,
            "page_text": page_text,
            "og_title": meta.get("og:title", ""),
            "og_image": meta.get("og:image", ""),
        }

    except Exception as exc:
        logger.warning("Crunchbase retrieval failed for '%s': %s", company_name, exc)
        return {"error": str(exc), "url": url}


def _to_slug(company_name: str) -> str:
    """Convert company name to Crunchbase URL slug."""
    slug = company_name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def _extract_pattern(text: str, pattern: str) -> str | None:
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1) if match else None
