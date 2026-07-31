"""ChromaDB vector store wrapper for RAG."""
from __future__ import annotations

import os
from typing import Any

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class VectorStoreManager:
    _client: chromadb.AsyncClientAPI | None = None
    _collections: dict[str, Any] = {}

    @classmethod
    async def initialize(cls) -> None:
        os.makedirs(settings.chroma_persist_dir, exist_ok=True)
        cls._client = await chromadb.AsyncHttpClient(
            host="localhost", port=8001
        ) if False else chromadb.PersistentClient(  # type: ignore[assignment]
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        logger.info("ChromaDB initialized at %s", settings.chroma_persist_dir)

    @classmethod
    def get_client(cls) -> chromadb.ClientAPI:  # type: ignore[return]
        if cls._client is None:
            os.makedirs(settings.chroma_persist_dir, exist_ok=True)
            cls._client = chromadb.PersistentClient(  # type: ignore[assignment]
                path=settings.chroma_persist_dir,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
        return cls._client  # type: ignore[return-value]

    @classmethod
    def get_or_create_collection(cls, collection_name: str) -> Any:
        client = cls.get_client()
        return client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    @classmethod
    def delete_collection(cls, collection_name: str) -> None:
        try:
            client = cls.get_client()
            client.delete_collection(collection_name)
        except Exception:
            pass

    @classmethod
    async def cleanup(cls) -> None:
        logger.info("ChromaDB cleanup complete")


def collection_name_for_report(report_id: str) -> str:
    """Generate a safe ChromaDB collection name from report ID."""
    return f"report_{report_id.replace('-', '_')}"
