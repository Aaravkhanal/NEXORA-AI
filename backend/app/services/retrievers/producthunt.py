"""
Product Hunt retriever — scrapes public Product Hunt pages for product data.
No API key needed for public data.
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


async def retrieve_producthunt(company_name: str) -> dict:
    """Search Product Hunt for products from a company."""
    # Search PH for the company
    search_url = f"https://www.producthunt.com/search?q={company_name.replace(' ', '+')}"

    try:
        async with httpx.AsyncClient(
            timeout=20,
            headers=HEADERS,
            follow_redirects=True,
        ) as client:
            resp = await client.get(search_url)
            if resp.status_code != 200:
                return {"error": f"HTTP {resp.status_code}"}
            html = resp.text

        soup = BeautifulSoup(html, "lxml")

        # Extract page text
        page_text = soup.get_text(separator=" ", strip=True)[:4000]

        # Extract meta info
        meta = {}
        for tag in soup.find_all("meta"):
            prop = tag.get("property") or tag.get("name") or ""
            content = tag.get("content") or ""
            if prop and content:
                meta[prop] = content

        # Try to find product listings
        products = []
        product_cards = soup.find_all("a", href=re.compile(r"/posts/"))[:5]
        for card in product_cards:
            text = card.get_text(strip=True)
            href = card.get("href", "")
            if text and href:
                products.append({
                    "title": text[:100],
                    "url": f"https://www.producthunt.com{href}",
                })

        logger.info("Retrieved Product Hunt data for '%s'", company_name)
        return {
            "search_url": search_url,
            "products": products,
            "page_text": page_text,
            "og_description": meta.get("og:description", ""),
        }

    except Exception as exc:
        logger.warning("Product Hunt retrieval failed for '%s': %s", company_name, exc)
        return {"error": str(exc), "products": []}
