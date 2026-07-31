"""
Nexus Intelligence — FastAPI Application Entry Point
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.job_store import job_store
from app.db.vector_store import VectorStoreManager

# Suppress annoying posthog errors from chromadb
logging.getLogger("posthog").setLevel(logging.ERROR)
logging.getLogger("chromadb.telemetry.posthog").setLevel(logging.ERROR)

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup and shutdown events."""
    await VectorStoreManager.initialize()
    await job_store.initialize()
    yield
    await VectorStoreManager.cleanup()


app = FastAPI(
    title="Nexus Intelligence API",
    version="2.0.0",
    description="Enterprise AI Company Intelligence Platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logging.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."}
    )


# Register routes
from app.api.routes import chat, progress, report, research

app.include_router(research.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(report.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

# We will add compare router here too if created.


@app.get("/api/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "version": "2.0.0"}
