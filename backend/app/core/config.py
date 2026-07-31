from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Primary LLMs ──────────────────────────────────────────────────────────
    gemini_api_key: str = ""
    openai_api_key: str = ""
    openai_api_base: str = "https://api.openai.com/v1"
    openai_model_name: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-small"

    # ── Additional Providers ──────────────────────────────────────────────────
    groq_api_key: str = ""
    openrouter_api_key: str = ""
    ollama_base_url: str = ""         # e.g. http://localhost:11434
    ollama_model: str = "llama3.1"

    # ── Data Sources ──────────────────────────────────────────────────────────
    github_token: str = ""
    news_api_key: str = ""
    alpha_vantage_key: str = ""
    tavily_api_key: str = ""

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = "development"
    log_level: str = "INFO"
    request_timeout: int = 30
    max_crawl_pages: int = 30
    cors_origins: str = "http://localhost:3000"

    # ── Multi-LLM Routing ─────────────────────────────────────────────────────
    consensus_mode: bool = False      # use 2 models + merger for high-stakes sections
    llm_chain: str = ""               # comma-separated override: "gemini,groq,nvidia_gemma"

    # ── Vector DB ─────────────────────────────────────────────────────────────
    chroma_persist_dir: str = "./data/chroma"
    embedding_model: str = "models/text-embedding-004"

    # ── Persistence ───────────────────────────────────────────────────────────
    sqlite_db_path: str = "./data/nexus.db"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def llm_provider(self) -> str:
        if self.gemini_api_key:
            return "gemini"
        if self.openai_api_key:
            if "nvidia.com" in self.openai_api_base:
                return "nvidia"
            return "openai"
        if self.groq_api_key:
            return "groq"
        if self.openrouter_api_key:
            return "openrouter"
        if self.ollama_base_url:
            return "ollama"
        return "none"


settings = Settings()
