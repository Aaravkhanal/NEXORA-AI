"""POST /api/research — kicks off async company research jobs."""
from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request

from app.core.logging import get_logger
from app.db.job_store import job_store
from app.models.schemas import ResearchJob, ResearchRequest
from app.services.report.pipeline import run_research_pipeline

router = APIRouter(tags=["research"])
logger = get_logger(__name__)

# Simple in-memory rate limiting: IP -> active job count
_active_jobs_per_ip: dict[str, int] = {}
MAX_JOBS_PER_IP = 5


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
    
    # Very basic URL validation
    if website and not website.startswith(("http://", "https://")):
        website = f"https://{website}"

    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if _active_jobs_per_ip.get(client_ip, 0) >= MAX_JOBS_PER_IP:
        raise HTTPException(429, "Too many active research jobs from your IP. Please wait for them to finish.")

    job = ResearchJob(
        company_name=company_name or website,
        website=website,
    )
    # Save to DB first so we can track it
    await job_store.create_job_async(job)
    _active_jobs_per_ip[client_ip] = _active_jobs_per_ip.get(client_ip, 0) + 1

    # Trigger via BackgroundTasks instead of Celery since local user doesn't have Redis
    background_tasks.add_task(run_research_pipeline, job)

    # Clean up rate limit state after some time or just let it reset (for simplicity here, 
    # we'll use a fire-and-forget task to decrement it after 5 minutes since we don't have
    # the exact completion hook in this process easily without redis pub/sub listening for it)
    async def cleanup_ip_limit():
        await asyncio.sleep(300)
        _active_jobs_per_ip[client_ip] = max(0, _active_jobs_per_ip.get(client_ip, 1) - 1)
    background_tasks.add_task(cleanup_ip_limit)

    logger.info("Started research job %s for '%s' (IP: %s)", job.id, job.company_name, client_ip)
    return {"job_id": job.id, "status": job.status}


@router.get("/research/{job_id}")
async def get_job_status(job_id: str) -> dict:
    """Get the current status of a research job."""
    job = await job_store.get_job_async(job_id)
    if not job:
        raise HTTPException(404, f"Job {job_id} not found.")
    return job.model_dump()
