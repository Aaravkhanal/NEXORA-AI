"""GitHub organisation retriever — refactored from original."""
from __future__ import annotations

import asyncio
import re
from typing import Any

import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)
GITHUB_API = "https://api.github.com"


def _auth_headers() -> dict[str, str]:
    h: dict[str, str] = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "NexusIntelligence/1.0",
    }
    if settings.github_token:
        h["Authorization"] = f"Bearer {settings.github_token}"
    return h


async def _get(url: str, client: httpx.AsyncClient, **params: Any) -> dict[str, Any]:
    resp = await client.get(url, headers=_auth_headers(), params=params, timeout=settings.request_timeout)
    resp.raise_for_status()
    return resp.json()  # type: ignore[no-any-return]


async def _guess_org_name(company_name: str) -> list[str]:
    """Generate candidate GitHub org slugs from company name."""
    slug = company_name.lower()
    candidates = [
        slug.replace(" ", ""),
        slug.replace(" ", "-"),
        slug.replace(" ", "_"),
        slug.split()[0] if " " in slug else slug,
    ]
    return list(dict.fromkeys(candidates))  # dedup preserving order


async def _try_org(org: str, client: httpx.AsyncClient) -> dict[str, Any] | None:
    try:
        return await _get(f"{GITHUB_API}/orgs/{org}", client)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            return None
        raise


async def retrieve_github(company_name: str) -> dict[str, Any]:
    candidates = await _guess_org_name(company_name)

    async with httpx.AsyncClient() as client:
        org_data: dict[str, Any] | None = None
        org_slug: str = candidates[0]

        for slug in candidates:
            org_data = await _try_org(slug, client)
            if org_data:
                org_slug = slug
                logger.info("Found GitHub org: %s", slug)
                break

        if not org_data:
            logger.warning("No GitHub org found for '%s'", company_name)
            return {"error": f"No GitHub org found for '{company_name}'"}

        # Fetch top repos
        try:
            repos_resp = await client.get(
                f"{GITHUB_API}/orgs/{org_slug}/repos",
                headers=_auth_headers(),
                params={"sort": "stars", "direction": "desc", "per_page": 10},
                timeout=settings.request_timeout,
            )
            repos_resp.raise_for_status()
            repos_data: list[dict[str, Any]] = repos_resp.json()
        except Exception:
            repos_data = []

        # Aggregate languages
        languages: dict[str, float] = {}
        for repo in repos_data[:5]:
            try:
                lang_resp = await client.get(
                    f"{GITHUB_API}/repos/{org_slug}/{repo['name']}/languages",
                    headers=_auth_headers(),
                    timeout=settings.request_timeout,
                )
                lang_resp.raise_for_status()
                for lang, count in lang_resp.json().items():
                    languages[lang] = languages.get(lang, 0) + count
            except Exception:
                pass

    top_repos = [
        {
            "name": r["name"],
            "url": r["html_url"],
            "description": r.get("description"),
            "stars": r.get("stargazers_count", 0),
            "forks": r.get("forks_count", 0),
            "language": r.get("language"),
        }
        for r in repos_data
    ]

    total_stars = sum(r["stars"] for r in top_repos)

    return {
        "source": "github",
        "org_name": org_data.get("login", org_slug),
        "public_repos": org_data.get("public_repos", 0),
        "total_stars": total_stars,
        "top_repos": top_repos,
        "languages": languages,
        "followers": org_data.get("followers", 0),
        "bio": org_data.get("description"),
        "blog": org_data.get("blog"),
        "location": org_data.get("location"),
        "github_url": org_data.get("html_url"),
    }
