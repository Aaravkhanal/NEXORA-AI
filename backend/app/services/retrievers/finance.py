"""Finance data retriever using yfinance and Alpha Vantage."""
from __future__ import annotations

import asyncio
from typing import Any

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def _format_large_number(n: float | None) -> str | None:
    if n is None:
        return None
    if n >= 1e12:
        return f"${n/1e12:.2f}T"
    if n >= 1e9:
        return f"${n/1e9:.2f}B"
    if n >= 1e6:
        return f"${n/1e6:.2f}M"
    return f"${n:,.0f}"


async def _fetch_yfinance(ticker: str) -> dict[str, Any]:
    """Fetch financial data via yfinance (runs in thread pool)."""
    def _sync_fetch() -> dict[str, Any]:
        try:
            import yfinance as yf  # type: ignore[import]
            stock = yf.Ticker(ticker)
            info = stock.info or {}
            return {
                "ticker": ticker,
                "company_name": info.get("longName") or info.get("shortName"),
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "market_cap": info.get("marketCap"),
                "revenue": info.get("totalRevenue"),
                "revenue_growth": info.get("revenueGrowth"),
                "gross_profit": info.get("grossProfits"),
                "ebitda": info.get("ebitda"),
                "net_income": info.get("netIncomeToCommon"),
                "employees": info.get("fullTimeEmployees"),
                "country": info.get("country"),
                "city": info.get("city"),
                "website": info.get("website"),
                "summary": info.get("longBusinessSummary", "")[:500],
                "stock_price": info.get("currentPrice") or info.get("regularMarketPrice"),
                "52w_high": info.get("fiftyTwoWeekHigh"),
                "52w_low": info.get("fiftyTwoWeekLow"),
                "pe_ratio": info.get("trailingPE"),
                "dividend_yield": info.get("dividendYield"),
                "is_public": True,
            }
        except Exception as exc:
            logger.debug("yfinance fetch failed for %s: %s", ticker, exc)
            return {"error": str(exc)}

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_fetch)


async def retrieve_finance(
    company_name: str,
    ticker: str | None = None,
    website: str | None = None,
) -> dict[str, Any]:
    """
    Attempt to retrieve financial data.
    If ticker is unknown, try common patterns.
    """
    if not ticker:
        # Try to guess common ticker patterns
        candidates = [
            company_name.upper().replace(" ", ""),
            company_name.split()[0].upper(),
        ]
        for candidate in candidates[:2]:
            data = await _fetch_yfinance(candidate)
            if "error" not in data and data.get("company_name"):
                logger.info("Found financial data for ticker: %s", candidate)
                # Format display values
                data["market_cap_display"] = _format_large_number(data.get("market_cap"))
                data["revenue_display"] = _format_large_number(data.get("revenue"))
                return data
        return {"error": "Could not determine ticker symbol", "is_public": False}

    data = await _fetch_yfinance(ticker)
    data["market_cap_display"] = _format_large_number(data.get("market_cap"))
    data["revenue_display"] = _format_large_number(data.get("revenue"))
    return data
