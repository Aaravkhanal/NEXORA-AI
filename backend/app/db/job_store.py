"""SQLite-backed job store with persistence."""
from __future__ import annotations

import asyncio
import json
from collections import defaultdict
from datetime import datetime
from typing import AsyncIterator

import aiosqlite

from app.core.config import settings
from app.core.logging import get_logger
from app.models.schemas import CompanyReport, JobStatus, ProgressEvent, ResearchJob

logger = get_logger(__name__)


class JobStore:
    """
    SQLite-backed store for research jobs, reports, and progress events.
    Reports and Jobs survive server restarts.
    """

    def __init__(self) -> None:
        self._db_path = settings.sqlite_db_path
        self._progress_queues: dict[str, asyncio.Queue[ProgressEvent | None]] = defaultdict(
            asyncio.Queue
        )
        self._initialized = False

    async def initialize(self) -> None:
        if self._initialized:
            return
        try:
            import os
            os.makedirs(os.path.dirname(self._db_path), exist_ok=True)
            
            async with aiosqlite.connect(self._db_path) as db:
                await db.execute("""
                    CREATE TABLE IF NOT EXISTS jobs (
                        id TEXT PRIMARY KEY,
                        company_name TEXT,
                        website TEXT,
                        status TEXT,
                        progress INTEGER,
                        current_step TEXT,
                        created_at TEXT,
                        completed_at TEXT,
                        report_id TEXT,
                        error TEXT,
                        data JSON
                    )
                """)
                await db.execute("""
                    CREATE TABLE IF NOT EXISTS reports (
                        id TEXT PRIMARY KEY,
                        company_name TEXT,
                        website TEXT,
                        generated_at TEXT,
                        data JSON
                    )
                """)
                await db.commit()
            self._initialized = True
            logger.info("SQLite JobStore initialized at %s", self._db_path)
        except Exception as e:
            logger.error("Failed to initialize SQLite JobStore: %s", e)

    # ── Jobs ──────────────────────────────────────────────────────────────────

    def create_job(self, job: ResearchJob) -> ResearchJob:
        # Sync wrapper - fires and forgets the async write
        asyncio.create_task(self._async_create_job(job))
        return job

    async def _async_create_job(self, job: ResearchJob) -> None:
        await self.initialize()
        async with aiosqlite.connect(self._db_path) as db:
            await db.execute(
                "INSERT INTO jobs (id, company_name, website, status, progress, current_step, created_at, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (job.id, job.company_name, job.website, job.status, job.progress, job.current_step, job.created_at.isoformat(), job.model_dump_json())
            )
            await db.commit()

    async def get_job_async(self, job_id: str) -> ResearchJob | None:
        await self.initialize()
        async with aiosqlite.connect(self._db_path) as db:
            async with db.execute("SELECT data FROM jobs WHERE id = ?", (job_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    try:
                        return ResearchJob.model_validate_json(row[0])
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
        job = await self.get_job_async(job_id)
        if not job:
            job = ResearchJob(id=job_id, company_name="Unknown")
            
        if status is not None:
            job.status = status
        if progress is not None:
            job.progress = progress
        if current_step is not None:
            job.current_step = current_step
        if report_id is not None:
            job.report_id = report_id
        if error is not None:
            job.error = error
        if status in (JobStatus.COMPLETED, JobStatus.FAILED):
            job.completed_at = datetime.now()

        await self.initialize()
        async with aiosqlite.connect(self._db_path) as db:
            completed_at = job.completed_at.isoformat() if job.completed_at else None
            await db.execute(
                """UPDATE jobs SET 
                    status = ?, progress = ?, current_step = ?, completed_at = ?, report_id = ?, error = ?, data = ?
                   WHERE id = ?""",
                (job.status, job.progress, job.current_step, completed_at, job.report_id, job.error, job.model_dump_json(), job.id)
            )
            await db.commit()

    # ── Reports ───────────────────────────────────────────────────────────────

    def save_report(self, report: CompanyReport) -> None:
        asyncio.create_task(self._async_save_report(report))

    async def _async_save_report(self, report: CompanyReport) -> None:
        await self.initialize()
        async with aiosqlite.connect(self._db_path) as db:
            await db.execute(
                "INSERT OR REPLACE INTO reports (id, company_name, website, generated_at, data) VALUES (?, ?, ?, ?, ?)",
                (report.id, report.company_name, report.website, report.generated_at.isoformat(), report.model_dump_json())
            )
            await db.commit()


    async def get_report_async(self, report_id: str) -> CompanyReport | None:
        await self.initialize()
        async with aiosqlite.connect(self._db_path) as db:
            async with db.execute("SELECT data FROM reports WHERE id = ?", (report_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    try:
                        return CompanyReport.model_validate_json(row[0])
                    except Exception as e:
                        logger.error("Failed to parse report JSON: %s", e)
        return None

    async def list_reports(self, limit: int = 50, offset: int = 0) -> list[CompanyReport]:
        await self.initialize()
        reports = []
        async with aiosqlite.connect(self._db_path) as db:
            async with db.execute(
                "SELECT data FROM reports ORDER BY generated_at DESC LIMIT ? OFFSET ?", 
                (limit, offset)
            ) as cursor:
                async for row in cursor:
                    try:
                        reports.append(CompanyReport.model_validate_json(row[0]))
                    except Exception as e:
                        logger.error("Failed to parse report JSON in list: %s", e)
        return reports

    async def delete_report(self, report_id: str) -> bool:
        await self.initialize()
        async with aiosqlite.connect(self._db_path) as db:
            cursor = await db.execute("DELETE FROM reports WHERE id = ?", (report_id,))
            await db.commit()
            return cursor.rowcount > 0

    # ── Progress Streaming ────────────────────────────────────────────────────

    async def emit_progress(self, event: ProgressEvent) -> None:
        queue = self._progress_queues[event.job_id]
        await queue.put(event)

    async def subscribe_progress(self, job_id: str) -> AsyncIterator[ProgressEvent]:
        queue = self._progress_queues[job_id]
        while True:
            event = await queue.get()
            if event is None:  # sentinel → stream done
                break
            yield event

    async def close_progress(self, job_id: str) -> None:
        await self._progress_queues[job_id].put(None)


job_store = JobStore()
