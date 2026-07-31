"""
Nexus Intelligence — Pydantic Schemas v2

All data models for the platform: reports, chat, jobs, retrievers.
Includes new models for milestones, knowledge graph, feature matrix, and geographic presence.
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


# ─── Enums ────────────────────────────────────────────────────────────────────

class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ConfidenceLevel(str, Enum):
    HIGH = "high"       # verified from official source
    MEDIUM = "medium"   # estimated from multiple sources
    LOW = "low"         # single-source or inferred


class CompanyType(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    STARTUP = "startup"
    NONPROFIT = "nonprofit"
    GOVERNMENT = "government"
    UNKNOWN = "unknown"


class MilestoneType(str, Enum):
    FOUNDING = "founding"
    FUNDING = "funding"
    PRODUCT = "product"
    ACQUISITION = "acquisition"
    IPO = "ipo"
    PARTNERSHIP = "partnership"
    EXPANSION = "expansion"
    AWARD = "award"
    OTHER = "other"


# ─── Source Metadata ─────────────────────────────────────────────────────────

class SourceRef(BaseModel):
    source: str
    url: str | None = None
    retrieved_at: datetime = Field(default_factory=datetime.now)
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM


class ConfidenceField(BaseModel):
    """A value with an associated confidence level and source reference."""
    value: Any
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM
    sources: list[str] = Field(default_factory=list)


# ─── Company Overview ─────────────────────────────────────────────────────────

class LeadershipMember(BaseModel):
    name: str
    title: str
    linkedin_url: str | None = None
    bio: str | None = None


class CompanyOverview(BaseModel):
    name: str
    website: str | None = None
    logo_url: str | None = None
    headquarters: str | None = None
    founded_year: int | None = None
    founders: list[str] = Field(default_factory=list)
    ceo: str | None = None
    leadership_team: list[LeadershipMember] = Field(default_factory=list)
    employee_count: str | None = None  # e.g. "10,000-50,000"
    industry: str | None = None
    business_category: str | None = None
    description: str | None = None
    mission: str | None = None
    vision: str | None = None
    core_values: list[str] = Field(default_factory=list)
    company_type: CompanyType = CompanyType.UNKNOWN
    ticker_symbol: str | None = None
    stock_exchange: str | None = None
    sources: list[SourceRef] = Field(default_factory=list)


# ─── Business Model ───────────────────────────────────────────────────────────

class BusinessModel(BaseModel):
    summary: str | None = None
    revenue_streams: list[str] = Field(default_factory=list)
    pricing_strategy: str | None = None
    customer_segments: list[str] = Field(default_factory=list)
    target_audience: str | None = None
    sales_channels: list[str] = Field(default_factory=list)
    distribution_strategy: str | None = None
    partnership_model: str | None = None
    subscription_model: bool = False
    enterprise_model: bool = False
    marketplace_model: bool = False
    sources: list[SourceRef] = Field(default_factory=list)


# ─── Revenue Intelligence ─────────────────────────────────────────────────────

class FundingRound(BaseModel):
    round_type: str           # Seed, Series A, IPO, etc.
    amount_usd: float | None = None
    date: str | None = None
    investors: list[str] = Field(default_factory=list)
    valuation_usd: float | None = None


class RevenueIntelligence(BaseModel):
    annual_revenue_usd: float | None = None
    annual_revenue_display: str | None = None   # "$2.3B"
    revenue_confidence: ConfidenceLevel = ConfidenceLevel.LOW
    growth_rate_yoy: float | None = None        # percentage
    arr: float | None = None                    # Annual Recurring Revenue
    mrr: float | None = None
    total_funding_usd: float | None = None
    valuation_usd: float | None = None
    valuation_display: str | None = None
    is_profitable: bool | None = None
    ebitda_usd: float | None = None
    funding_rounds: list[FundingRound] = Field(default_factory=list)
    is_public: bool = False
    stock_price: float | None = None
    market_cap_usd: float | None = None
    market_cap_display: str | None = None
    sources: list[SourceRef] = Field(default_factory=list)
    notes: str | None = None


# ─── Products & Services ─────────────────────────────────────────────────────

class Product(BaseModel):
    name: str
    description: str | None = None
    category: str | None = None
    pricing: str | None = None
    features: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    platforms: list[str] = Field(default_factory=list)
    integrations: list[str] = Field(default_factory=list)
    url: str | None = None


# ─── Technology Stack ─────────────────────────────────────────────────────────

class TechStack(BaseModel):
    frontend: list[str] = Field(default_factory=list)
    backend: list[str] = Field(default_factory=list)
    frameworks: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    databases: list[str] = Field(default_factory=list)
    cloud_providers: list[str] = Field(default_factory=list)
    cdn: list[str] = Field(default_factory=list)
    analytics: list[str] = Field(default_factory=list)
    ai_ml: list[str] = Field(default_factory=list)
    apis: list[str] = Field(default_factory=list)
    authentication: list[str] = Field(default_factory=list)
    payment_providers: list[str] = Field(default_factory=list)
    infrastructure: list[str] = Field(default_factory=list)
    sources: list[SourceRef] = Field(default_factory=list)


# ─── Market Analysis ─────────────────────────────────────────────────────────

class SwotAnalysis(BaseModel):
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    opportunities: list[str] = Field(default_factory=list)
    threats: list[str] = Field(default_factory=list)


class MarketAnalysis(BaseModel):
    market_position: str | None = None
    market_size_usd: str | None = None
    market_share: str | None = None
    swot: SwotAnalysis = Field(default_factory=SwotAnalysis)
    key_differentiators: list[str] = Field(default_factory=list)
    sources: list[SourceRef] = Field(default_factory=list)


# ─── Competitor Analysis ──────────────────────────────────────────────────────

class CompetitorProfile(BaseModel):
    name: str
    website: str | None = None
    overview: str | None = None
    market_share: str | None = None
    revenue_display: str | None = None
    employee_count: str | None = None
    founded_year: int | None = None
    advantages: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    pricing_comparison: str | None = None
    key_features: list[str] = Field(default_factory=list)
    competitive_position: str | None = None


class FeatureComparisonRow(BaseModel):
    """One feature row in the competitor feature matrix."""
    feature: str
    target_company: str  # "yes", "partial", "no", or description
    competitors: dict[str, str] = Field(default_factory=dict)  # {competitor_name: status}
    importance: str = "medium"  # "high", "medium", "low"


class CompetitorNarrative(BaseModel):
    """Long-form competitive analysis narrative."""
    summary: str | None = None
    competitive_dynamics: str | None = None
    positioning_map: str | None = None  # text description of market positioning
    moat_analysis: str | None = None
    threat_assessment: str | None = None


# ─── Company Timeline / Milestones ────────────────────────────────────────────

class CompanyMilestone(BaseModel):
    year: int
    month: int | None = None
    title: str
    description: str | None = None
    milestone_type: MilestoneType = MilestoneType.OTHER
    amount_usd: float | None = None  # for funding rounds
    significance: str = "medium"    # "high", "medium", "low"


# ─── Geographic Presence ─────────────────────────────────────────────────────

class GeographicPresence(BaseModel):
    headquarters_country: str | None = None
    headquarters_city: str | None = None
    countries_present: list[str] = Field(default_factory=list)
    regions: list[str] = Field(default_factory=list)
    has_global_presence: bool = False
    key_markets: list[str] = Field(default_factory=list)
    expansion_trajectory: str | None = None


# ─── Strategic Recommendations ────────────────────────────────────────────────

class StrategicRecommendation(BaseModel):
    category: str  # "growth", "risk", "investment", "competitive", "technology"
    title: str
    description: str
    priority: str = "medium"  # "critical", "high", "medium", "low"
    timeframe: str | None = None  # "0-6 months", "6-18 months", "2+ years"
    rationale: str | None = None


# ─── Knowledge Graph ─────────────────────────────────────────────────────────

class KnowledgeGraphNode(BaseModel):
    id: str
    label: str
    type: str  # "company", "person", "product", "competitor", "investor", "technology"
    url: str | None = None
    description: str | None = None


class KnowledgeGraphEdge(BaseModel):
    source: str   # node id
    target: str   # node id
    label: str    # "founded_by", "acquired", "competes_with", "uses", "invested_in"
    strength: float = 1.0  # 0-1


class KnowledgeGraph(BaseModel):
    nodes: list[KnowledgeGraphNode] = Field(default_factory=list)
    edges: list[KnowledgeGraphEdge] = Field(default_factory=list)


# ─── AI Summary ───────────────────────────────────────────────────────────────

class AiScores(BaseModel):
    business_health: int = Field(0, ge=0, le=100)
    innovation: int = Field(0, ge=0, le=100)
    ai_readiness: int = Field(0, ge=0, le=100)
    growth_potential: int = Field(0, ge=0, le=100)
    investment_risk: int = Field(0, ge=0, le=100)   # higher = riskier
    operational_maturity: int = Field(0, ge=0, le=100)
    customer_trust: int = Field(0, ge=0, le=100)
    digital_maturity: int = Field(0, ge=0, le=100)


class AiSummary(BaseModel):
    executive_summary: str | None = None
    one_liner: str | None = None
    scores: AiScores = Field(default_factory=AiScores)
    future_opportunities: list[str] = Field(default_factory=list)
    key_risks: list[str] = Field(default_factory=list)
    investment_thesis: str | None = None


# ─── News Item ────────────────────────────────────────────────────────────────

class NewsItem(BaseModel):
    title: str
    url: str
    source: str | None = None
    published_at: str | None = None
    summary: str | None = None
    sentiment: str | None = None  # "positive", "negative", "neutral"


# ─── GitHub Data ─────────────────────────────────────────────────────────────

class RepoInfo(BaseModel):
    name: str
    url: str
    description: str | None = None
    stars: int = 0
    forks: int = 0
    language: str | None = None


class GitHubData(BaseModel):
    org_name: str
    public_repos: int = 0
    total_stars: int = 0
    top_repos: list[RepoInfo] = Field(default_factory=list)
    languages: dict[str, float] = Field(default_factory=dict)
    contributors_count: int = 0
    followers: int = 0
    bio: str | None = None
    blog: str | None = None


# ─── Full Company Report ──────────────────────────────────────────────────────

class CompanyReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    company_name: str
    website: str | None = None
    generated_at: datetime = Field(default_factory=datetime.now)
    generation_time_seconds: float = 0.0

    # Core sections
    overview: CompanyOverview = Field(default_factory=lambda: CompanyOverview(name=""))
    business_model: BusinessModel = Field(default_factory=BusinessModel)
    revenue_intelligence: RevenueIntelligence = Field(default_factory=RevenueIntelligence)
    products: list[Product] = Field(default_factory=list)
    tech_stack: TechStack = Field(default_factory=TechStack)
    market_analysis: MarketAnalysis = Field(default_factory=MarketAnalysis)
    competitors: list[CompetitorProfile] = Field(default_factory=list)
    recent_news: list[NewsItem] = Field(default_factory=list)
    github: GitHubData | None = None
    ai_summary: AiSummary = Field(default_factory=AiSummary)

    # New v2 sections
    milestones: list[CompanyMilestone] = Field(default_factory=list)
    feature_matrix: list[FeatureComparisonRow] = Field(default_factory=list)
    competitor_narrative: CompetitorNarrative = Field(default_factory=CompetitorNarrative)
    geographic_presence: GeographicPresence = Field(default_factory=GeographicPresence)
    strategic_recommendations: list[StrategicRecommendation] = Field(default_factory=list)
    knowledge_graph: KnowledgeGraph = Field(default_factory=KnowledgeGraph)

    # Metadata
    raw_content: list[str] = Field(default_factory=list, exclude=True)
    sources_used: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    models_used: list[str] = Field(default_factory=list)


# ─── Job / Progress ───────────────────────────────────────────────────────────

class ProgressEvent(BaseModel):
    job_id: str
    step: str
    message: str
    progress: int = Field(0, ge=0, le=100)
    status: JobStatus = JobStatus.RUNNING
    timestamp: datetime = Field(default_factory=datetime.now)


class ResearchJob(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    company_name: str
    website: str | None = None
    status: JobStatus = JobStatus.PENDING
    progress: int = 0
    current_step: str = "Initializing..."
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: datetime | None = None
    report_id: str | None = None
    error: str | None = None


# ─── Chat ─────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    sources: list[SourceRef] = Field(default_factory=list)
    model_used: str | None = None
    timestamp: datetime = Field(default_factory=datetime.now)


class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    report_id: str
    company_name: str
    messages: list[ChatMessage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)


# ─── API Request/Response ─────────────────────────────────────────────────────

class ResearchRequest(BaseModel):
    company_name: str | None = None
    website: str | None = None


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ReportListItem(BaseModel):
    id: str
    company_name: str
    website: str | None = None
    generated_at: datetime
    generation_time_seconds: float
    sources_used: list[str] = Field(default_factory=list)
    models_used: list[str] = Field(default_factory=list)
    one_liner: str | None = None


class CompareRequest(BaseModel):
    report_id_a: str
    report_id_b: str
