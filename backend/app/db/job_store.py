"""SQLAlchemy & Redis-backed job store with persistence."""
from __future__ import annotations

import asyncio
import json
from datetime import datetime
from typing import AsyncIterator

import redis.asyncio as redis
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from app.core.config import settings
from app.core.logging import get_logger
from app.models.schemas import CompanyReport, JobStatus, ProgressEvent, ResearchJob
from app.db.session import AsyncSessionLocal, engine, Base
from app.db.models import JobModel, ReportModel

logger = get_logger(__name__)


class JobStore:
    def __init__(self) -> None:
        self._redis_url = settings.redis_url
        self._redis_client = None
        self._initialized = False

    async def initialize(self) -> None:
        if self._initialized:
            return
        try:
            # Create tables if they don't exist
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            # Initialize Redis connection for Pub/Sub
            self._redis_client = redis.from_url(self._redis_url, decode_responses=True)
            self._initialized = True
            logger.info("JobStore initialized with PostgreSQL and Redis at %s", self._redis_url)
        except Exception as e:
            logger.error("Failed to initialize JobStore: %s", e)

    # ── Jobs ──────────────────────────────────────────────────────────────────

    async def create_job_async(self, job: ResearchJob) -> ResearchJob:
        await self.initialize()
        async with AsyncSessionLocal() as session:
            job_model = JobModel(
                id=job.id,
                company_name=job.company_name,
                website=job.website,
                status=job.status,
                progress=job.progress,
                current_step=job.current_step,
                created_at=job.created_at,
                data=job.model_dump()
            )
            session.add(job_model)
            await session.commit()
        return job

    def create_job(self, job: ResearchJob) -> ResearchJob:
        # FastAPI routes might still be calling this sync wrapper, we'll keep it for compatibility if any route does
        asyncio.create_task(self.create_job_async(job))
        return job

    async def get_job_async(self, job_id: str) -> ResearchJob | None:
        await self.initialize()
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(JobModel).where(JobModel.id == job_id))
            job_model = result.scalar_one_or_none()
            if job_model and job_model.data:
                try:
                    return ResearchJob.model_validate(job_model.data)
                except Exception as e:
                    logger.error("Failed to parse job JSON: %s", e)
        return None

    async def update_job_async(
        self,
        job_id: str,
        *,
        status: JobStatus | None = None,
        progress: int | None = None,
        current_step: str | None = None,
        report_id: str | None = None,
        error: str | None = None,
    ) -> None:
        await self.initialize()
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(JobModel).where(JobModel.id == job_id))
            job_model = result.scalar_one_or_none()
            if not job_model:
                job_model = JobModel(id=job_id, company_name="Unknown", data={})
                session.add(job_model)

            # Update DB columns
            if status is not None:
                job_model.status = status
            if progress is not None:
                job_model.progress = progress
            if current_step is not None:
                job_model.current_step = current_step
            if report_id is not None:
                job_model.report_id = report_id
            if error is not None:
                job_model.error = error
            if status in (JobStatus.COMPLETED, JobStatus.FAILED):
                job_model.completed_at = datetime.utcnow()

            # Merge back into data blob for full representation
            data = job_model.data or {}
            data.update({
                "id": job_model.id,
                "company_name": job_model.company_name,
                "website": job_model.website,
                "status": job_model.status,
                "progress": job_model.progress,
                "current_step": job_model.current_step,
                "report_id": job_model.report_id,
                "error": job_model.error,
                "created_at": job_model.created_at.isoformat() if job_model.created_at else None,
                "completed_at": job_model.completed_at.isoformat() if job_model.completed_at else None,
            })
            job_model.data = data
            
            await session.commit()

    # ── Reports ───────────────────────────────────────────────────────────────

    async def save_report_async(self, report: CompanyReport) -> None:
        await self.initialize()
        async with AsyncSessionLocal() as session:
            report_model = ReportModel(
                id=report.id,
                company_name=report.company_name,
                website=report.website,
                generated_at=report.generated_at,
                data=report.model_dump()
            )
            await session.merge(report_model)
            await session.commit()

    def save_report(self, report: CompanyReport) -> None:
        asyncio.create_task(self.save_report_async(report))

    async def get_report_async(self, report_id: str) -> CompanyReport | None:
        await self.initialize()
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(ReportModel).where(ReportModel.id == report_id))
            report_model = result.scalar_one_or_none()
            if report_model and report_model.data:
                try:
                    return CompanyReport.model_validate(report_model.data)
                except Exception as e:
                    logger.error("Failed to parse report JSON: %s", e)
        return None

    async def list_reports(self, limit: int = 50, offset: int = 0) -> list[CompanyReport]:
        await self.initialize()
        reports = []
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(ReportModel).order_by(ReportModel.generated_at.desc()).limit(limit).offset(offset)
            )
            for row in result.scalars():
                if row.data:
                    try:
                        reports.append(CompanyReport.model_validate(row.data))
                    except Exception as e:
                        logger.error("Failed to parse report JSON in list: %s", e)
        return reports

    async def delete_report(self, report_id: str) -> bool:
        await self.initialize()
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(ReportModel).where(ReportModel.id == report_id))
            report_model = result.scalar_one_or_none()
            if report_model:
                await session.delete(report_model)
                await session.commit()
                return True
            return False

    # ── Progress Streaming (Redis Pub/Sub) ────────────────────────────────────

    async def emit_progress(self, event: ProgressEvent) -> None:
        await self.initialize()
        if not self._redis_client:
            return
        channel = f"job_progress:{event.job_id}"
        try:
            await self._redis_client.publish(channel, event.model_dump_json())
        except Exception as e:
            logger.warning(f"Failed to emit progress (Redis down?): {e}")

    async def subscribe_progress(self, job_id: str) -> AsyncIterator[ProgressEvent]:
        await self.initialize()
        if not self._redis_client:
            yield ProgressEvent(job_id=job_id, step="Error", message="Real-time progress unavailable (Redis disconnected)", progress=100, status="failed", timestamp=datetime.utcnow().isoformat())
            return
            
        channel = f"job_progress:{job_id}"
        try:
            pubsub = self._redis_client.pubsub()
            await pubsub.subscribe(channel)
        except Exception as e:
            logger.warning(f"Failed to subscribe progress (Redis down?): {e}")
            return
            
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"]
                    if data == "DONE":
                        break
                    yield ProgressEvent.model_validate_json(data)
        except Exception:
            pass
        finally:
            await pubsub.unsubscribe(channel)

    async def close_progress(self, job_id: str) -> None:
        await self.initialize()
        if not self._redis_client:
            return
        channel = f"job_progress:{job_id}"
        try:
            await self._redis_client.publish(channel, "DONE")
        except Exception:
            pass

job_store = JobStore()
