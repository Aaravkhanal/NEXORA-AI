"""GET /api/progress/{job_id} — Server-Sent Events progress stream."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.core.logging import get_logger
from app.db.job_store import job_store
from app.models.schemas import JobStatus

router = APIRouter(tags=["progress"])
logger = get_logger(__name__)


@router.get("/progress/{job_id}")
async def stream_progress(job_id: str) -> EventSourceResponse:
    """Server-Sent Events stream for real-time research progress."""
    job = await job_store.get_job_async(job_id)
    if not job:
        raise HTTPException(404, "Job not found.")

    async def event_generator():
        # If already completed/failed, send final state immediately
        if job.status in (JobStatus.COMPLETED, JobStatus.FAILED):
            yield {
                "event": "progress",
                "data": f'{{"step": "{job.current_step}", "progress": {job.progress}, "status": "{job.status}"}}'
            }
            return

        async for event in job_store.subscribe_progress(job_id):
            data = event.model_dump_json()
            yield {"event": "progress", "data": data}

            if event.status in (JobStatus.COMPLETED, JobStatus.FAILED):
                break

    return EventSourceResponse(event_generator())
