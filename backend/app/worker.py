import asyncio
from celery import Celery

from app.core.config import settings
from app.core.logging import get_logger
from app.db.job_store import job_store
from app.services.report.pipeline import run_research_pipeline
from app.models.schemas import JobStatus

logger = get_logger(__name__)

celery_app = Celery(
    "nexora_tasks",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

# Optional: configure celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="execute_research_job")
def execute_research_job(job_id: str) -> str:
    """
    Celery task to run the research pipeline in the background.
    Since run_research_pipeline is async, we need to run it in a new event loop.
    """
    logger.info("Celery worker starting research job %s", job_id)
    
    # We must run the async pipeline synchronously in this Celery worker process
    loop = asyncio.get_event_loop()
    
    async def run_job_async():
        # Fetch the job from the database
        job = await job_store.get_job_async(job_id)
        if not job:
            logger.error("Job %s not found in DB", job_id)
            return "Failed: Job not found"
        
        try:
            await run_research_pipeline(job)
            return "Success"
        except Exception as e:
            logger.error("Pipeline failed for job %s: %s", job_id, e)
            # Make sure it's marked as failed if pipeline threw unhandled exception
            await job_store.update_job_async(job_id, status=JobStatus.FAILED, error=str(e))
            return f"Failed: {e}"

    return loop.run_until_complete(run_job_async())
