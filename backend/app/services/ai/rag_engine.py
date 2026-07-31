"""RAG engine — chunk, embed, store, and retrieve company knowledge."""
from __future__ import annotations

import hashlib
import uuid
from typing import Any

from app.core.logging import get_logger
from app.db.vector_store import VectorStoreManager, collection_name_for_report
from app.services.ai.llm_client import get_embeddings
from app.services.crawlers.content_extractor import chunk_text

logger = get_logger(__name__)


def _embed_texts(texts: list[str]) -> list[list[float]]:
    embeddings = get_embeddings()
    return embeddings.embed_documents(texts)  # type: ignore[no-any-return]


def _embed_query(text: str) -> list[float]:
    embeddings = get_embeddings()
    return embeddings.embed_query(text)  # type: ignore[no-any-return]


def build_knowledge_base(
    report_id: str,
    documents: list[dict[str, str]],  # [{url, title, text}]
) -> int:
    """
    Chunk all documents, embed them, and store in ChromaDB.
    Returns total number of chunks stored.
    """
    collection = VectorStoreManager.get_or_create_collection(
        collection_name_for_report(report_id)
    )

    all_chunks: list[str] = []
    all_ids: list[str] = []
    all_metadatas: list[dict[str, Any]] = []

    for doc in documents:
        chunks = chunk_text(doc.get("text", ""), chunk_size=800, overlap=150)
        for i, chunk in enumerate(chunks):
            chunk_id = hashlib.md5(f"{doc.get('url', '')}{i}{chunk[:50]}".encode()).hexdigest()
            all_chunks.append(chunk)
            all_ids.append(chunk_id)
            all_metadatas.append({
                "url": doc.get("url", ""),
                "title": doc.get("title", ""),
                "chunk_index": i,
                "source": doc.get("source", "web"),
            })

    if not all_chunks:
        logger.warning("No chunks to embed for report %s", report_id)
        return 0

    # Embed in batches of 50
    batch_size = 50
    for i in range(0, len(all_chunks), batch_size):
        batch_chunks = all_chunks[i:i + batch_size]
        batch_ids = all_ids[i:i + batch_size]
        batch_metas = all_metadatas[i:i + batch_size]

        try:
            embeddings = _embed_texts(batch_chunks)
            collection.upsert(
                ids=batch_ids,
                embeddings=embeddings,
                documents=batch_chunks,
                metadatas=batch_metas,
            )
            logger.debug("Embedded batch %d/%d", i // batch_size + 1, (len(all_chunks) + batch_size - 1) // batch_size)
        except Exception as exc:
            logger.error("Embedding batch failed: %s", exc)

    logger.info("Built knowledge base: %d chunks for report %s", len(all_chunks), report_id)
    return len(all_chunks)


def search_knowledge_base(
    report_id: str,
    query: str,
    n_results: int = 5,
) -> list[dict[str, Any]]:
    """
    Semantic search the knowledge base for a report.
    Returns list of {text, url, title, distance} dicts.
    """
    collection = VectorStoreManager.get_or_create_collection(
        collection_name_for_report(report_id)
    )

    try:
        query_embedding = _embed_query(query)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(n_results, collection.count() or 1),
            include=["documents", "metadatas", "distances"],
        )

        output: list[dict[str, Any]] = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for doc, meta, dist in zip(docs, metas, distances):
            output.append({
                "text": doc,
                "url": meta.get("url", ""),
                "title": meta.get("title", ""),
                "source": meta.get("source", ""),
                "relevance_score": round(1 - dist, 3),
            })

        return output

    except Exception as exc:
        logger.error("Search failed for report %s: %s", report_id, exc)
        return []
