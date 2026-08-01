"""POST /api/research — kicks off async company research jobs.

FIXES:
- Rate limiter now properly decrements on job completion/failure (not just timeout)
- Added /api/admin/reset-rate-limit endpoint for stuck states in development
- Added better error logging throughout
"""
from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request

from app.core.logging import get_logger
from app.db.job_store import job_store
from app.models.schemas import JobStatus, ResearchJob, ResearchRequest
from app.services.report.pipeline import run_research_pipeline

router = APIRouter(tags=["research"])
logger = get_logger(__name__)

# In-memory rate limiting: IP -> active job count
_active_jobs_per_ip: dict[str, int] = {}
MAX_JOBS_PER_IP = 3


async def _run_pipeline_with_cleanup(job: ResearchJob, client_ip: str) -> None:
    """Wrapper that always decrements the rate limit counter after pipeline runs."""
    try:
        await run_research_pipeline(job)
    except Exception as exc:
        logger.error("Pipeline failed for job %s: %s", job.id, exc)
    finally:
        # Always decrement, even on failure
        _active_jobs_per_ip[client_ip] = max(0, _active_jobs_per_ip.get(client_ip, 1) - 1)
        logger.info("Rate limit counter for IP %s decremented to %d", client_ip, _active_jobs_per_ip.get(client_ip, 0))


@router.post("/research")
async def start_research(
    req: ResearchRequest,
    background_tasks: BackgroundTasks,
    request: Request,
) -> dict:
    """Start a new company research job."""
    if not req.company_name and not req.website:
        raise HTTPException(400, "Must provide company_name or website")

    # Clean input
    company_name = (req.company_name or "").strip()[:100]
    website = (req.website or "").strip()[:200]
    
    # Basic URL normalization
    if website and not website.startswith(("http://", "https://")):
        website = f"https://{website}"

    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    active = _active_jobs_per_ip.get(client_ip, 0)
    if active >= MAX_JOBS_PER_IP:
        raise HTTPException(
            429,
            f"Too many active research jobs from your IP ({active} active). "
            "Please wait for them to finish or use /api/admin/reset-rate-limit in development."
        )

    job = ResearchJob(
        company_name=company_name or website,
        website=website,
    )
    
    # Save to DB first so we can track it
    await job_store.create_job_async(job)
    _active_jobs_per_ip[client_ip] = active + 1
    
    logger.info(
        "Started research job %s for '%s' (IP: %s, active jobs: %d)",
        job.id, job.company_name, client_ip, _active_jobs_per_ip[client_ip]
    )

    # Use the cleanup wrapper so rate limit is always decremented
    background_tasks.add_task(_run_pipeline_with_cleanup, job, client_ip)

    return {"job_id": job.id, "status": job.status}


@router.get("/research/{job_id}")
async def get_job_status(job_id: str) -> dict:
    """Get the current status of a research job."""
    job = await job_store.get_job_async(job_id)
    if not job:
        raise HTTPException(404, f"Job {job_id} not found.")
    return job.model_dump()


@router.delete("/admin/reset-rate-limit")
async def reset_rate_limit() -> dict:
    """Dev-only: Reset the in-memory rate limiter if stuck jobs prevent new searches."""
    _active_jobs_per_ip.clear()
    logger.info("Rate limit counters reset by admin endpoint")
    return {"status": "cleared", "message": "All rate limit counters reset."}


@router.get("/admin/active-jobs")
async def get_active_jobs() -> dict:
    """Dev-only: See current rate limit state."""
    return {"active_jobs_per_ip": dict(_active_jobs_per_ip)}
