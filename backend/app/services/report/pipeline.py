"""
Main research pipeline v2 — orchestrates all data collection, embedding, and report generation.
Emits real-time progress events via the job store.
Integrates 8 data sources: Wikipedia, GitHub, News, Finance, Crunchbase, HN, Reddit, ProductHunt + Web Crawl.

FIXES:
- More granular progress events per phase
- Better error surface on individual source failures
- Pipeline never silently hangs
"""
from __future__ import annotations

import asyncio
import re
import time
from typing import Any

from app.core.logging import get_logger
from app.db.job_store import job_store
from app.models.schemas import (
    CompanyMilestone,
    CompanyReport,
    FeatureComparisonRow,
    GitHubData,
    JobStatus,
    NewsItem,
    ProgressEvent,
    RepoInfo,
    ResearchJob,
)
from app.services.ai.rag_engine import build_knowledge_base
from app.services.ai.report_generator import generate_full_report_sections
from app.services.crawlers.web_crawler import crawl_website
from app.services.retrievers.crunchbase import retrieve_crunchbase
from app.services.retrievers.finance import retrieve_finance
from app.services.retrievers.github import retrieve_github
from app.services.retrievers.hackernews import retrieve_hackernews
from app.services.retrievers.news import retrieve_news
from app.services.retrievers.producthunt import retrieve_producthunt
from app.services.retrievers.reddit import retrieve_reddit
from app.services.retrievers.wikipedia import retrieve_wikipedia

logger = get_logger(__name__)


async def _emit(job_id: str, step: str, message: str, progress: int) -> None:
    event = ProgressEvent(
        job_id=job_id,
        step=step,
        message=message,
        progress=progress,
        status=JobStatus.RUNNING,
    )
    await job_store.emit_progress(event)
    await job_store.update_job_async(job_id, progress=progress, current_step=message)
    logger.info("[%s] %d%% — %s", job_id[:8], progress, message)


def _extract_official_website(wiki_result: dict) -> str | None:
    """Try to extract the official website from Wikipedia data."""
    if url := wiki_result.get("official_website") or wiki_result.get("website"):
        return url

    full_text = wiki_result.get("full_text", "")
    patterns = [
        r"(?:official website|website)[:\s]+(?:https?://)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})",
        r"https?://(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})[/\s]",
    ]
    for pattern in patterns:
        match = re.search(pattern, full_text[:5000], re.IGNORECASE)
        if match:
            domain = match.group(1).strip(".,/)")
            if "wikipedia" not in domain and len(domain) > 4:
                return f"https://{domain}"

    return None


async def run_research_pipeline(job: ResearchJob) -> CompanyReport:
    """
    Full research pipeline v2. Runs 8-source data gathering, AI analysis, and RAG indexing.
    Updates progress events throughout. Never silently fails.
    """
    start_time = time.time()
    job_id = job.id
    company_name = job.company_name
    website = job.website

    raw_data: dict[str, Any] = {}

    try:
        # ── Step 1: Discover website via Wikipedia ────────────────────────────
        await _emit(job_id, "discovery", "Searching...", 5)

        try:
            wiki_result = await asyncio.wait_for(retrieve_wikipedia(company_name), timeout=30)
            raw_data["wikipedia"] = wiki_result
        except Exception as e:
            logger.warning("Wikipedia retrieval failed: %s", e)
            wiki_result = {}

        if not website:
            website = _extract_official_website(wiki_result)

        # ── Step 2: Parallel data fetching (7 sources) ────────────────────────
        await _emit(job_id, "fetching", "Collecting Company Data...", 12)

        fetch_results = await asyncio.gather(
            asyncio.wait_for(retrieve_github(company_name), timeout=20),
            asyncio.wait_for(retrieve_news(company_name), timeout=20),
            asyncio.wait_for(retrieve_finance(company_name), timeout=20),
            asyncio.wait_for(retrieve_hackernews(company_name), timeout=20),
            asyncio.wait_for(retrieve_reddit(company_name), timeout=20),
            asyncio.wait_for(retrieve_crunchbase(company_name), timeout=20),
            asyncio.wait_for(retrieve_producthunt(company_name), timeout=20),
            return_exceptions=True,
        )

        source_names = ["github", "news", "finance", "hackernews", "reddit", "crunchbase", "producthunt"]
        source_status: dict[str, str] = {}
        for name, result in zip(source_names, fetch_results):
            if isinstance(result, Exception):
                logger.warning("Source '%s' failed: %s", name, result)
                source_status[name] = f"failed: {type(result).__name__}"
            else:
                raw_data[name] = result
                source_status[name] = "ok"

        logger.info("Data fetch complete: %s", source_status)
        
        successful = sum(1 for s in source_status.values() if s == "ok")
        await _emit(job_id, "fetching", f"Collecting Company Data...", 22)

        # ── Step 3: Web crawling ──────────────────────────────────────────────
        crawled_pages: list[dict[str, str]] = []
        if website:
            await _emit(job_id, "crawling", f"🕷️ Crawling {website}...", 28)
            try:
                crawled_pages = await asyncio.wait_for(
                    crawl_website(website, max_pages=15),
                    timeout=60,
                )
                raw_data["crawled_pages"] = crawled_pages
                # Extract logo from crawled pages
                for page in crawled_pages[:3]:
                    logo = page.get("og_image") or page.get("favicon")
                    if logo and not raw_data.get("logo_url"):
                        raw_data["logo_url"] = logo
                await _emit(job_id, "crawling", f"🕷️ Crawled {len(crawled_pages)} pages from {website}", 35)
            except asyncio.TimeoutError:
                logger.warning("Web crawl timed out for %s", website)
                await _emit(job_id, "crawling", "⚠️ Website crawl timed out, continuing with other sources...", 35)
            except Exception as exc:
                logger.warning("Web crawl failed: %s", exc)
                await _emit(job_id, "crawling", "⚠️ Website unavailable, using other sources...", 35)
        else:
            await _emit(job_id, "crawling", "⚠️ No website found, skipping crawl...", 35)

        # ── Step 4: Build RAG knowledge base ──────────────────────────────────
        await _emit(job_id, "indexing", "Launching AI Agents...", 40)

        all_docs: list[dict[str, str]] = []
        all_docs.extend(crawled_pages)

        if wiki := raw_data.get("wikipedia", {}):
            if "full_text" in wiki:
                all_docs.append({
                    "url": wiki.get("url", ""),
                    "title": wiki.get("title", "Wikipedia"),
                    "text": wiki.get("full_text", ""),
                    "source": "wikipedia",
                })

        for item in (raw_data.get("news") or [])[:15]:
            if item.get("summary"):
                all_docs.append({
                    "url": item.get("url", ""),
                    "title": item.get("title", ""),
                    "text": item.get("summary", "") + " " + item.get("content", ""),
                    "source": "news",
                })

        for hn_post in (raw_data.get("hackernews", {}).get("results", []))[:5]:
            if hn_post.get("text"):
                all_docs.append({
                    "url": hn_post.get("url", ""),
                    "title": hn_post.get("title", ""),
                    "text": hn_post.get("text", ""),
                    "source": "hackernews",
                })

        if all_docs:
            try:
                loop = asyncio.get_event_loop()
                chunks_count = await asyncio.wait_for(
                    loop.run_in_executor(None, build_knowledge_base, job_id, all_docs),
                    timeout=60,
                )
                logger.info("Indexed %d chunks for RAG", chunks_count)
                await _emit(job_id, "indexing", "Launching AI Agents...", 45)
            except asyncio.TimeoutError:
                logger.warning("RAG indexing timed out — chat will still work from report data")
            except Exception as exc:
                logger.warning("RAG indexing failed (non-fatal): %s", exc)
        
        # ── Step 5: AI Report Generation (3 batched phases) ──────────────────

        # The report generator now runs in 3 sequential batches with internal progress
        # We update progress at the end of each batch
        async def on_progress(step: str, message: str, progress: int) -> None:
            await _emit(job_id, step, message, progress)

        sections = await generate_full_report_sections(company_name, raw_data, emit_cb=on_progress)

        await _emit(job_id, "synthesizing", "Generating Final Report...", 90)

        # ── Step 6: Assemble final report ─────────────────────────────────────
        elapsed = round(time.time() - start_time, 2)

        # Build GitHub model
        github_model: GitHubData | None = None
        if isinstance(raw_data.get("github"), dict) and "error" not in raw_data.get("github", {}):
            gh = raw_data["github"]
            try:
                github_model = GitHubData(
                    org_name=gh.get("org_name", ""),
                    public_repos=gh.get("public_repos", 0),
                    total_stars=gh.get("total_stars", 0),
                    top_repos=[RepoInfo(**r) for r in gh.get("top_repos", [])],
                    languages=gh.get("languages", {}),
                    followers=gh.get("followers", 0),
                    bio=gh.get("bio"),
                    blog=gh.get("blog"),
                )
            except Exception as e:
                logger.warning("GitHub model build failed: %s", e)

        # Build news items with sentiment
        news_items = [
            NewsItem(
                title=n.get("title", ""),
                url=n.get("url", ""),
                source=n.get("source"),
                published_at=n.get("published_at"),
                summary=n.get("summary"),
                sentiment=n.get("sentiment"),
            )
            for n in (raw_data.get("news") or [])[:15]
        ]

        # Track which sources were successfully used
        sources_used = []
        for source_name, key in [
            ("wikipedia", "wikipedia"), ("github", "github"), ("news", "news"),
            ("finance", "finance"), ("hackernews", "hackernews"), ("reddit", "reddit"),
            ("crunchbase", "crunchbase"), ("producthunt", "producthunt"),
        ]:
            if key in raw_data and "error" not in (raw_data[key] if isinstance(raw_data[key], dict) else {}):
                sources_used.append(source_name)
        if crawled_pages:
            sources_used.append("web_crawl")

        report = CompanyReport(
            id=job_id,
            company_name=company_name,
            website=website,
            generation_time_seconds=elapsed,
            overview=sections["overview"],
            business_model=sections["business_model"],
            revenue_intelligence=sections["revenue_intelligence"],
            products=sections["products"],
            tech_stack=sections["tech_stack"],
            market_analysis=sections["market_analysis"],
            competitors=sections["competitors"],
            recent_news=news_items,
            github=github_model,
            ai_summary=sections["ai_summary"],
            milestones=sections["milestones"],
            feature_matrix=sections["feature_matrix"],
            competitor_narrative=sections["competitor_narrative"],
            geographic_presence=sections["geographic_presence"],
            strategic_recommendations=sections["strategic_recommendations"],
            knowledge_graph=sections["knowledge_graph"],
            sources_used=sources_used,
            models_used=sections.get("models_used", []),
        )

        await job_store.save_report_async(report)
        await job_store.update_job_async(
            job_id,
            status=JobStatus.COMPLETED,
            progress=100,
            current_step="✅ Report complete!",
            report_id=report.id,
        )

        await _emit(job_id, "complete", "✅ Intelligence report ready!", 100)
        await job_store.close_progress(job_id)

        logger.info(
            "Pipeline complete for '%s' in %.1fs using sources: %s",
            company_name, elapsed, sources_used
        )
        return report

    except Exception as exc:
        logger.exception("Pipeline failed for job %s: %s", job_id, exc)
        await job_store.update_job_async(
            job_id,
            status=JobStatus.FAILED,
            error=str(exc),
            current_step=f"❌ Failed: {exc}",
        )
        error_event = ProgressEvent(
            job_id=job_id,
            step="error",
            message=f"❌ Research failed: {exc}",
            progress=0,
            status=JobStatus.FAILED,
        )
        await job_store.emit_progress(error_event)
        await job_store.close_progress(job_id)
        raise
