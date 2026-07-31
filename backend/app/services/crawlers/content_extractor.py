"""HTML content extraction and text cleaning."""
from __future__ import annotations

import re

from bs4 import BeautifulSoup

_REMOVE_TAGS = {"script", "style", "nav", "footer", "header", "aside",
                "noscript", "iframe", "form", "button", "input", "select"}

_BOILERPLATE_PATTERNS = [
    r"cookie[s]?\s*(policy|notice|consent)",
    r"privacy\s*policy",
    r"terms\s*(of\s*(service|use))?",
    r"all\s*rights\s*reserved",
    r"©\s*\d{4}",
    r"subscribe\s*to\s*(our\s*)?(newsletter|updates)",
]
_BOILERPLATE_RE = re.compile("|".join(_BOILERPLATE_PATTERNS), re.IGNORECASE)


def extract_text(html: str) -> tuple[str, str]:
    """
    Extract clean text and title from HTML.
    Returns (text, title).
    """
    soup = BeautifulSoup(html, "lxml")

    # Get title
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else ""

    # Remove noise tags
    for tag in soup.find_all(_REMOVE_TAGS):
        tag.decompose()

    # Try main content area first
    main = (
        soup.find("main")
        or soup.find("article")
        or soup.find(id=re.compile(r"(main|content|body)", re.I))
        or soup.find(class_=re.compile(r"(main|content|body)", re.I))
        or soup.body
        or soup
    )

    raw_text = main.get_text(separator="\n", strip=True) if main else ""  # type: ignore[union-attr]

    # Clean text
    lines = raw_text.splitlines()
    cleaned_lines: list[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if len(stripped) < 10:
            continue
        if _BOILERPLATE_RE.search(stripped):
            continue
        cleaned_lines.append(stripped)

    # Deduplicate consecutive identical lines
    deduped: list[str] = []
    prev = ""
    for line in cleaned_lines:
        if line != prev:
            deduped.append(line)
        prev = line

    text = "\n".join(deduped)

    # Collapse excessive whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip(), title


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks for embedding."""
    if len(text) <= chunk_size:
        return [text]

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        # Try to break at sentence boundary
        if end < len(text):
            last_period = chunk.rfind(". ")
            if last_period > chunk_size // 2:
                chunk = chunk[: last_period + 1]
                end = start + last_period + 1

        chunks.append(chunk.strip())
        start = end - overlap

    return [c for c in chunks if len(c.strip()) > 50]
