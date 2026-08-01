"""AI report generator v2 — uses multi-LLM routing with role-based model assignment.
Each generator function is assigned an appropriate LLM role for best results.

FIXES:
- Phase 1 now runs in 3 batches of 3 instead of 9 concurrent (avoids rate limits)
- Each section wrapped in asyncio.wait_for to prevent hangs
- Graceful fallback per-section (failure of one doesn't kill the report)
"""
from __future__ import annotations

import asyncio
import json
import re
from typing import Any, Callable, Awaitable

from app.core.config import settings
from app.core.logging import get_logger
from app.models.schemas import (
    AiScores,
    AiSummary,
    BusinessModel,
    CompanyMilestone,
    CompanyOverview,
    CompanyType,
    CompetitorNarrative,
    CompetitorProfile,
    ConfidenceLevel,
    FeatureComparisonRow,
    FundingRound,
    GeographicPresence,
    KnowledgeGraph,
    KnowledgeGraphEdge,
    KnowledgeGraphNode,
    MarketAnalysis,
    MilestoneType,
    Product,
    RevenueIntelligence,
    SourceRef,
    StrategicRecommendation,
    SwotAnalysis,
    TechStack,
)
from app.services.ai.multi_llm import consensus_invoke, multi_llm_invoke

logger = get_logger(__name__)

_SECTION_TIMEOUT = 120.0  # Max seconds per section

_SYSTEM_PROMPT = """You are an elite company intelligence analyst at a top-tier global research firm (like McKinsey, Gartner, or CB Insights).
Your analysis is precise, factual, evidence-based, and structured.
Always base your answers on the provided source material. If specific information is not available, make your best informed estimate and clearly note uncertainty.
Output ONLY valid JSON exactly matching the requested schema — no markdown fences, no extra text, no explanation outside the JSON."""


def _extract_json(text: str) -> Any:
    """Robustly extract JSON from LLM response, handling markdown code blocks."""
    text = re.sub(r"```(?:json)?\n?", "", text).strip().rstrip("```").strip()
    # Find first { or [
    brace_idx = text.find("{")
    bracket_idx = text.find("[")
    
    if brace_idx == -1 and bracket_idx == -1:
        raise ValueError("No JSON found in LLM response")
    
    if brace_idx == -1:
        start = bracket_idx
    elif bracket_idx == -1:
        start = brace_idx
    else:
        start = min(brace_idx, bracket_idx)
    
    text = text[start:]
    
    # Find matching end
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find the largest valid JSON prefix
        for end in range(len(text), 0, -1):
            try:
                return json.loads(text[:end])
            except json.JSONDecodeError:
                continue
        raise ValueError(f"Could not parse JSON from: {text[:200]}")


def _build_context(raw_data: dict[str, Any], max_chars: int = 12000) -> str:
    """Build relevance-weighted context string from all retrieved raw data."""
    parts: list[tuple[int, str]] = []  # (priority, text)

    # Priority 1: Wikipedia (most structured)
    if wiki := raw_data.get("wikipedia", {}):
        if "summary" in wiki:
            content = f"=== Wikipedia ===\n{wiki['summary']}\n\n{wiki.get('full_text', '')[:4000]}"
            parts.append((1, content))

    # Priority 2: Financial data (highly specific)
    if finance := raw_data.get("finance", {}):
        if "error" not in finance:
            content = f"=== Financial Data ===\n{json.dumps(finance, indent=2)}"
            parts.append((2, content))

    # Priority 3: GitHub (developer signal)
    if gh := raw_data.get("github", {}):
        if "error" not in gh:
            content = f"=== GitHub ===\n{json.dumps(gh, indent=2)}"
            parts.append((3, content))

    # Priority 4: Crawled website (primary source)
    if pages := raw_data.get("crawled_pages", []):
        page_parts = []
        for p in pages[:12]:
            text = (p.get("text") or "")[:2000]
            if text:
                page_parts.append(f"URL: {p.get('url', '')}\nTitle: {p.get('title', '')}\n{text}")
        if page_parts:
            combined = "\n\n---\n\n".join(page_parts)
            parts.append((4, f"=== Website Content ===\n{combined}"))

    # Priority 5: Crunchbase
    if cb := raw_data.get("crunchbase", {}):
        if "error" not in cb:
            content = f"=== Crunchbase ===\n{cb.get('page_text', '')[:2000]}"
            parts.append((5, content))

    # Priority 6: Recent news
    if news := raw_data.get("news", []):
        news_text = "\n".join(
            f"- {n['title']} ({n.get('source', 'unknown')}, {n.get('published_at', '')}): {n.get('summary', '')[:200]}"
            for n in news[:12]
        )
        parts.append((6, f"=== Recent News ===\n{news_text}"))

    # Priority 7: Hacker News sentiment
    if hn := raw_data.get("hackernews", {}):
        results = hn.get("results", [])[:5]
        if results:
            hn_text = "\n".join(f"- [{r.get('points', 0)}pts] {r.get('title', '')}" for r in results)
            parts.append((7, f"=== Hacker News Discussions ===\n{hn_text}"))

    # Priority 8: Reddit sentiment
    if reddit := raw_data.get("reddit", {}):
        posts = reddit.get("results", [])[:5]
        if posts:
            r_text = "\n".join(
                f"- r/{p.get('subreddit', '')} | Score:{p.get('score', 0)} | {p.get('title', '')}"
                for p in posts
            )
            parts.append((8, f"=== Reddit Discussions ===\n{r_text}"))

    # Sort by priority and concatenate within budget
    parts.sort(key=lambda x: x[0])
    combined_parts = [text for _, text in parts]
    context = "\n\n".join(combined_parts)
    return context[:max_chars]


# ── Safe section wrapper ───────────────────────────────────────────────────────

async def _safe_section(coro, section_name: str, fallback):
    """Run a section coroutine with timeout; return fallback on any failure."""
    try:
        return await asyncio.wait_for(coro, timeout=_SECTION_TIMEOUT)
    except asyncio.TimeoutError:
        logger.error("Section '%s' timed out after %ss", section_name, _SECTION_TIMEOUT)
        return fallback
    except Exception as exc:
        logger.error("Section '%s' failed: %s", section_name, exc)
        return fallback


# ── Report Section Generators ─────────────────────────────────────────────────

async def generate_overview(company_name: str, raw_data: dict[str, Any]) -> tuple[CompanyOverview, str]:
    context = _build_context(raw_data)
    prompt = f"""Based on the following sources, extract company overview for "{company_name}".

{context}

Return JSON exactly matching this schema:
{{
  "name": "string",
  "website": "string or null",
  "logo_url": "string or null",
  "headquarters": "string or null",
  "founded_year": number or null,
  "founders": ["list of strings"],
  "ceo": "string or null",
  "leadership_team": [{{"name": "string", "title": "string"}}],
  "employee_count": "string or null (e.g. '10,000-50,000')",
  "industry": "string or null",
  "business_category": "string or null",
  "description": "2-3 sentence description",
  "mission": "string or null",
  "vision": "string or null",
  "core_values": ["list of strings"],
  "company_type": "public|private|startup|nonprofit|government|unknown",
  "ticker_symbol": "string or null",
  "stock_exchange": "string or null"
}}"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="analyst")
        data = _extract_json(raw)
        data["name"] = data.get("name") or company_name
        overview = CompanyOverview(**data)
        overview.sources = [SourceRef(source="ai_synthesis", confidence=ConfidenceLevel.MEDIUM)]
        return overview, model
    except Exception as exc:
        logger.error("Overview generation failed: %s", exc)
        return CompanyOverview(name=company_name), "error"


async def generate_business_model(company_name: str, raw_data: dict[str, Any]) -> tuple[BusinessModel, str]:
    context = _build_context(raw_data)
    prompt = f"""Analyze "{company_name}" and extract its business model from:

{context}

Return JSON:
{{
  "summary": "1-2 paragraph explanation of how the company makes money",
  "revenue_streams": ["list of revenue streams"],
  "pricing_strategy": "string describing pricing approach",
  "customer_segments": ["list of customer types"],
  "target_audience": "string",
  "sales_channels": ["list of channels"],
  "distribution_strategy": "string or null",
  "partnership_model": "string or null",
  "subscription_model": true or false,
  "enterprise_model": true or false,
  "marketplace_model": true or false
}}"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="analyst")
        data = _extract_json(raw)
        bm = BusinessModel(**data)
        bm.sources = [SourceRef(source="ai_synthesis", confidence=ConfidenceLevel.MEDIUM)]
        return bm, model
    except Exception as exc:
        logger.error("Business model generation failed: %s", exc)
        return BusinessModel(), "error"


async def generate_revenue_intelligence(company_name: str, raw_data: dict[str, Any]) -> tuple[RevenueIntelligence, str]:
    context = _build_context(raw_data)
    prompt = f"""Extract financial/revenue intelligence for "{company_name}":

{context}

Return JSON:
{{
  "annual_revenue_usd": number or null,
  "annual_revenue_display": "string like '$2.3B' or null",
  "revenue_confidence": "high|medium|low",
  "growth_rate_yoy": number (percentage) or null,
  "arr": number or null,
  "mrr": number or null,
  "total_funding_usd": number or null,
  "valuation_usd": number or null,
  "valuation_display": "string or null",
  "is_profitable": true/false/null,
  "ebitda_usd": number or null,
  "funding_rounds": [{{"round_type": "string", "amount_usd": number, "date": "YYYY or YYYY-MM string", "investors": ["investor names"]}}],
  "is_public": true or false,
  "stock_price": number or null,
  "market_cap_usd": number or null,
  "market_cap_display": "string or null",
  "notes": "string explaining estimation methodology"
}}"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="analyst")
        data = _extract_json(raw)
        rev = RevenueIntelligence(**data)
        rev.sources = [SourceRef(source="ai_synthesis", confidence=ConfidenceLevel.LOW)]
        return rev, model
    except Exception as exc:
        logger.error("Revenue intelligence generation failed: %s", exc)
        return RevenueIntelligence(), "error"


async def generate_products(company_name: str, raw_data: dict[str, Any]) -> tuple[list[Product], str]:
    context = _build_context(raw_data)
    prompt = f"""List the main products and services of "{company_name}":

{context}

Return JSON array (max 8 products):
[{{
  "name": "product name",
  "description": "2-3 sentence description",
  "category": "category string",
  "pricing": "pricing description or null",
  "features": ["key features list"],
  "technologies": ["tech used"],
  "platforms": ["web, iOS, Android, etc."],
  "integrations": ["key integrations"],
  "url": "product URL or null"
}}]"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="analyst")
        data = _extract_json(raw)
        products = [Product(**p) for p in (data if isinstance(data, list) else [])]
        return products, model
    except Exception as exc:
        logger.error("Products generation failed: %s", exc)
        return [], "error"


async def generate_tech_stack(company_name: str, raw_data: dict[str, Any]) -> tuple[TechStack, str]:
    context = _build_context(raw_data)
    gh_langs = list(raw_data.get("github", {}).get("languages", {}).keys())[:8]
    prompt = f"""Detect the technology stack of "{company_name}". GitHub languages detected: {gh_langs}.

{context}

Return JSON:
{{
  "frontend": ["React, Angular, etc."],
  "backend": ["Node.js, Python, etc."],
  "frameworks": ["Next.js, Django, etc."],
  "languages": ["JavaScript, Python, etc."],
  "databases": ["PostgreSQL, MongoDB, etc."],
  "cloud_providers": ["AWS, GCP, Azure, etc."],
  "cdn": ["Cloudflare, Fastly, etc."],
  "analytics": ["Google Analytics, Mixpanel, etc."],
  "ai_ml": ["TensorFlow, PyTorch, OpenAI, etc."],
  "apis": ["Stripe, Twilio, etc."],
  "authentication": ["Auth0, Cognito, etc."],
  "payment_providers": ["Stripe, PayPal, etc."],
  "infrastructure": ["Kubernetes, Docker, etc."]
}}"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="critic")
        data = _extract_json(raw)
        stack = TechStack(**data)
        stack.sources = [SourceRef(source="ai_synthesis", confidence=ConfidenceLevel.MEDIUM)]
        return stack, model
    except Exception as exc:
        logger.error("Tech stack generation failed: %s", exc)
        return TechStack(languages=gh_langs), "error"


async def generate_market_analysis(company_name: str, raw_data: dict[str, Any]) -> tuple[MarketAnalysis, str]:
    context = _build_context(raw_data)
    prompt = f"""Conduct market analysis for "{company_name}":

{context}

Return JSON:
{{
  "market_position": "description of market position",
  "market_size_usd": "string like '$50B' or null",
  "market_share": "string like '~15%' or null",
  "swot": {{
    "strengths": ["list of 4-6 strengths"],
    "weaknesses": ["list of 3-5 weaknesses"],
    "opportunities": ["list of 3-5 opportunities"],
    "threats": ["list of 3-5 threats"]
  }},
  "key_differentiators": ["list of 3-5 differentiators"]
}}"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="analyst")
        data = _extract_json(raw)
        swot_data = data.pop("swot", {})
        analysis = MarketAnalysis(**data)
        analysis.swot = SwotAnalysis(**swot_data)
        analysis.sources = [SourceRef(source="ai_synthesis", confidence=ConfidenceLevel.MEDIUM)]
        return analysis, model
    except Exception as exc:
        logger.error("Market analysis generation failed: %s", exc)
        return MarketAnalysis(), "error"


async def generate_competitors(company_name: str, raw_data: dict[str, Any]) -> tuple[list[CompetitorProfile], str]:
    context = _build_context(raw_data)
    prompt = f"""Identify and analyze the top 6-7 competitors of "{company_name}":

{context}

Return JSON array:
[{{
  "name": "competitor name",
  "website": "URL or null",
  "overview": "2 sentence overview",
  "market_share": "estimated market share string or null",
  "revenue_display": "string like '$1.2B' or null",
  "employee_count": "string or null",
  "founded_year": number or null,
  "advantages": ["list of 3 advantages over {company_name}"],
  "weaknesses": ["list of 2-3 weaknesses"],
  "pricing_comparison": "string describing how pricing compares",
  "key_features": ["list of key features"],
  "competitive_position": "leader|challenger|niche|emerging"
}}]"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="analyst")
        data = _extract_json(raw)
        competitors = [CompetitorProfile(**c) for c in (data if isinstance(data, list) else [])]
        return competitors, model
    except Exception as exc:
        logger.error("Competitor generation failed: %s", exc)
        return [], "error"


async def generate_milestones(company_name: str, raw_data: dict[str, Any]) -> tuple[list[CompanyMilestone], str]:
    context = _build_context(raw_data, max_chars=8000)
    prompt = f"""Extract key milestones and timeline events for "{company_name}":

{context}

Return JSON array of up to 15 milestones, sorted by year ascending:
[{{
  "year": number (4-digit year),
  "month": number or null (1-12),
  "title": "short event title (max 60 chars)",
  "description": "1-2 sentence description",
  "milestone_type": "founding|funding|product|acquisition|ipo|partnership|expansion|award|other",
  "amount_usd": number or null (for funding rounds),
  "significance": "high|medium|low"
}}]"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="analyst")
        data = _extract_json(raw)
        milestones = []
        for m in (data if isinstance(data, list) else []):
            try:
                milestones.append(CompanyMilestone(**m))
            except Exception:
                pass
        milestones.sort(key=lambda x: (x.year, x.month or 0))
        return milestones, model
    except Exception as exc:
        logger.error("Milestones generation failed: %s", exc)
        return [], "error"


async def generate_feature_matrix(
    company_name: str,
    competitors: list[CompetitorProfile],
    raw_data: dict[str, Any],
) -> tuple[list[FeatureComparisonRow], str]:
    """Generate feature comparison matrix against top 4 competitors."""
    competitor_names = [c.name for c in competitors[:4]]
    context = _build_context(raw_data, max_chars=6000)
    prompt = f"""Create a feature comparison matrix for "{company_name}" vs competitors: {competitor_names}.

{context}

Return JSON array of 8-12 important feature rows:
[{{
  "feature": "Feature name (e.g. 'AI Integration', 'Mobile App', 'API Access')",
  "target_company": "yes|partial|no|description",
  "competitors": {{
    {', '.join(f'"{name}": "yes|partial|no|description"' for name in competitor_names)}
  }},
  "importance": "high|medium|low"
}}]"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="critic")
        data = _extract_json(raw)
        rows = []
        for row in (data if isinstance(data, list) else []):
            try:
                rows.append(FeatureComparisonRow(**row))
            except Exception:
                pass
        return rows, model
    except Exception as exc:
        logger.error("Feature matrix generation failed: %s", exc)
        return [], "error"


async def generate_competitor_narrative(
    company_name: str,
    raw_data: dict[str, Any],
) -> tuple[CompetitorNarrative, str]:
    context = _build_context(raw_data, max_chars=8000)
    prompt = f"""Write a comprehensive competitive analysis narrative for "{company_name}":

{context}

Return JSON:
{{
  "summary": "2-3 paragraph overview of competitive landscape",
  "competitive_dynamics": "2 paragraphs on how competition is evolving in this market",
  "positioning_map": "Description of where {company_name} sits in the market vs competitors (premium/value, enterprise/SMB, etc.)",
  "moat_analysis": "Analysis of {company_name}'s competitive moat and defensibility",
  "threat_assessment": "Assessment of most serious competitive threats and their likelihood"
}}"""
    try:
        if settings.consensus_mode:
            raw = await consensus_invoke(_SYSTEM_PROMPT, prompt)
            model = "consensus"
        else:
            raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="analyst")
        data = _extract_json(raw)
        return CompetitorNarrative(**data), model
    except Exception as exc:
        logger.error("Competitor narrative generation failed: %s", exc)
        return CompetitorNarrative(), "error"


async def generate_geographic_presence(
    company_name: str,
    raw_data: dict[str, Any],
) -> tuple[GeographicPresence, str]:
    context = _build_context(raw_data, max_chars=6000)
    prompt = f"""Identify the geographic presence and expansion of "{company_name}":

{context}

Return JSON:
{{
  "headquarters_country": "country name or null",
  "headquarters_city": "city name or null",
  "countries_present": ["list of countries with operations"],
  "regions": ["North America", "Europe", "APAC", etc.],
  "has_global_presence": true or false,
  "key_markets": ["top 3-5 revenue/user markets"],
  "expansion_trajectory": "description of expansion trend"
}}"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="critic")
        data = _extract_json(raw)
        return GeographicPresence(**data), model
    except Exception as exc:
        logger.error("Geographic presence generation failed: %s", exc)
        return GeographicPresence(), "error"


async def generate_strategic_recommendations(
    company_name: str,
    raw_data: dict[str, Any],
    sections_summary: str,
) -> tuple[list[StrategicRecommendation], str]:
    context = _build_context(raw_data, max_chars=4000)
    prompt = f"""Generate strategic recommendations for "{company_name}" based on research:

Research context:
{context}

Report summary:
{sections_summary[:3000]}

Return JSON array of 6-8 actionable recommendations:
[{{
  "category": "growth|risk|investment|competitive|technology|operations",
  "title": "Short recommendation title",
  "description": "2-3 sentence detailed recommendation",
  "priority": "critical|high|medium|low",
  "timeframe": "0-6 months|6-18 months|2+ years",
  "rationale": "Why this recommendation matters now"
}}]"""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="polisher")
        data = _extract_json(raw)
        recs = []
        for r in (data if isinstance(data, list) else []):
            try:
                recs.append(StrategicRecommendation(**r))
            except Exception:
                pass
        return recs, model
    except Exception as exc:
        logger.error("Strategic recommendations generation failed: %s", exc)
        return [], "error"


async def generate_knowledge_graph(
    company_name: str,
    overview: CompanyOverview,
    competitors: list[CompetitorProfile],
    raw_data: dict[str, Any],
) -> tuple[KnowledgeGraph, str]:
    context = _build_context(raw_data, max_chars=4000)
    prompt = f"""Build a knowledge graph for "{company_name}".

Overview: {overview.model_dump_json()[:1000]}
Competitors: {[c.name for c in competitors[:5]]}
Context: {context[:2000]}

Return JSON with nodes and edges:
{{
  "nodes": [
    {{"id": "company_main", "label": "{company_name}", "type": "company", "url": "website url or null", "description": "one liner"}},
    {{"id": "unique_id", "label": "name", "type": "person|company|product|competitor|investor|technology", "url": null, "description": "short desc"}}
  ],
  "edges": [
    {{"source": "company_main", "target": "target_node_id", "label": "founded_by|acquired|competes_with|uses|invested_in|produces", "strength": 0.8}}
  ]
}}

Include: founders, CEO, key products (from {company_name}), top competitors, key investors if known, key technologies.
Aim for 15-25 nodes total."""
    try:
        raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="critic")
        data = _extract_json(raw)
        nodes = [KnowledgeGraphNode(**n) for n in data.get("nodes", [])]
        edges = [KnowledgeGraphEdge(**e) for e in data.get("edges", [])]
        return KnowledgeGraph(nodes=nodes, edges=edges), model
    except Exception as exc:
        logger.error("Knowledge graph generation failed: %s", exc)
        return KnowledgeGraph(), "error"


async def generate_ai_summary(
    company_name: str,
    raw_data: dict[str, Any],
    report_sections: dict[str, Any],
) -> tuple[AiSummary, str]:
    context = _build_context(raw_data, max_chars=4000)
    sections_str = json.dumps(report_sections, default=str)[:3000]
    prompt = f"""Generate an executive AI summary for "{company_name}":

Research context:
{context}

Report sections:
{sections_str}

Return JSON:
{{
  "executive_summary": "4-5 paragraph comprehensive executive summary covering company overview, business model, market position, competitive landscape, and outlook",
  "one_liner": "One crisp, memorable sentence describing what the company does and its market position",
  "scores": {{
    "business_health": 0-100,
    "innovation": 0-100,
    "ai_readiness": 0-100,
    "growth_potential": 0-100,
    "investment_risk": 0-100,
    "operational_maturity": 0-100,
    "customer_trust": 0-100,
    "digital_maturity": 0-100
  }},
  "future_opportunities": ["list of 4-5 specific future opportunities"],
  "key_risks": ["list of 4-5 specific key risks"],
  "investment_thesis": "3 paragraph balanced investment thesis covering bull case, bear case, and key watchpoints"
}}"""
    try:
        if settings.consensus_mode:
            raw = await consensus_invoke(_SYSTEM_PROMPT, prompt)
            model = "consensus"
        else:
            raw, model = await multi_llm_invoke(_SYSTEM_PROMPT, prompt, role="polisher")
        data = _extract_json(raw)
        scores_data = data.pop("scores", {})
        summary = AiSummary(**data)
        summary.scores = AiScores(**{k: min(100, max(0, int(v or 0))) for k, v in scores_data.items()})
        return summary, model
    except Exception as exc:
        logger.error("AI summary generation failed: %s", exc)
        return AiSummary(executive_summary=f"AI analysis for {company_name} is currently unavailable."), "error"


# ── Orchestrator ──────────────────────────────────────────────────────────────

async def generate_full_report_sections(
    company_name: str,
    raw_data: dict[str, Any],
    emit_cb: Callable[[str, str, int], Awaitable[None]] | None = None,
) -> dict[str, Any]:
    """
    Run all core report sections in batched parallel groups to avoid rate limits.
    
    Phase 1A: First 3 sections (highest priority)
    Phase 1B: Next 3 sections
    Phase 1C: Final 3 sections  
    Phase 2: Dependent sections using Phase 1 results
    """
    logger.info("Phase 1: Concurrent Generation of all core sections")
    if emit_cb:
        await emit_cb("analyzing", "✨ AI analyzing all company dimensions concurrently...", 55)
    (
        (overview, m1),
        (business_model, m2),
        (revenue_intel, m3),
        (products, m4),
        (tech_stack, m5),
        (market_analysis, m6),
        (competitors, m7),
        (milestones, m8),
        (geographic_presence, m9),
    ) = await asyncio.gather(
        _safe_section(generate_overview(company_name, raw_data), "overview", (CompanyOverview(name=company_name), "error")),
        _safe_section(generate_business_model(company_name, raw_data), "business_model", (BusinessModel(), "error")),
        _safe_section(generate_revenue_intelligence(company_name, raw_data), "revenue_intelligence", (RevenueIntelligence(), "error")),
        _safe_section(generate_products(company_name, raw_data), "products", ([], "error")),
        _safe_section(generate_tech_stack(company_name, raw_data), "tech_stack", (TechStack(), "error")),
        _safe_section(generate_market_analysis(company_name, raw_data), "market_analysis", (MarketAnalysis(), "error")),
        _safe_section(generate_competitors(company_name, raw_data), "competitors", ([], "error")),
        _safe_section(generate_milestones(company_name, raw_data), "milestones", ([], "error")),
        _safe_section(generate_geographic_presence(company_name, raw_data), "geographic_presence", (GeographicPresence(), "error")),
    )

    await asyncio.sleep(2)

    # Phase 2: Sections that depend on Phase 1 results
    logger.info("Phase 2: Feature matrix, narrative, recommendations, knowledge graph, AI summary")
    if emit_cb:
        await emit_cb("synthesizing", "📊 Synthesizing all intelligence...", 85)
    sections_summary = json.dumps({
        "overview": overview.model_dump(),
        "business_model": business_model.model_dump(),
        "revenue_intelligence": revenue_intel.model_dump(),
        "market_analysis": market_analysis.model_dump(),
    }, default=str)[:4000]

    (
        (feature_matrix, m10),
        (competitor_narrative, m11),
        (strategic_recommendations, m12),
        (knowledge_graph, m13),
        (ai_summary, m14),
    ) = await asyncio.gather(
        _safe_section(generate_feature_matrix(company_name, competitors, raw_data), "feature_matrix", ([], "error")),
        _safe_section(generate_competitor_narrative(company_name, raw_data), "competitor_narrative", (CompetitorNarrative(), "error")),
        _safe_section(generate_strategic_recommendations(company_name, raw_data, sections_summary), "strategic_recommendations", ([], "error")),
        _safe_section(generate_knowledge_graph(company_name, overview, competitors, raw_data), "knowledge_graph", (KnowledgeGraph(), "error")),
        _safe_section(
            generate_ai_summary(company_name, raw_data, {
                "overview": overview.model_dump(),
                "business_model": business_model.model_dump(),
                "revenue_intelligence": revenue_intel.model_dump(),
            }),
            "ai_summary",
            (AiSummary(executive_summary=f"Analysis for {company_name}."), "error"),
        ),
    )

    models_used = list({m for m in [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14] if m and m != "error"})

    return {
        "overview": overview,
        "business_model": business_model,
        "revenue_intelligence": revenue_intel,
        "products": products,
        "tech_stack": tech_stack,
        "market_analysis": market_analysis,
        "competitors": competitors,
        "milestones": milestones,
        "feature_matrix": feature_matrix,
        "competitor_narrative": competitor_narrative,
        "geographic_presence": geographic_presence,
        "strategic_recommendations": strategic_recommendations,
        "knowledge_graph": knowledge_graph,
        "ai_summary": ai_summary,
        "models_used": models_used,
    }
