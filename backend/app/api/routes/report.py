"""GET /api/reports and GET /api/report/{id} endpoints + export."""
from __future__ import annotations

import json
from io import BytesIO

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

from app.core.logging import get_logger
from app.db.job_store import job_store
from app.db.vector_store import VectorStoreManager, collection_name_for_report
from app.models.schemas import ReportListItem

router = APIRouter(tags=["reports"])
logger = get_logger(__name__)


@router.get("/reports", response_model=list[ReportListItem])
async def list_reports(limit: int = 50, offset: int = 0) -> list[ReportListItem]:
    """List all generated reports."""
    reports = await job_store.list_reports(limit=limit, offset=offset)
    
    items = []
    for r in reports:
        items.append(
            ReportListItem(
                id=r.id,
                company_name=r.company_name,
                website=r.website,
                generated_at=r.generated_at,
                generation_time_seconds=r.generation_time_seconds,
                sources_used=r.sources_used,
                models_used=r.models_used,
                one_liner=r.ai_summary.one_liner,
            )
        )
    return items


@router.get("/report/{report_id}")
async def get_report(report_id: str) -> dict:
    """Get a full report by ID."""
    report = await job_store.get_report_async(report_id)
    if not report:
        raise HTTPException(404, f"Report {report_id} not found.")
    return report.model_dump()


@router.delete("/report/{report_id}")
async def delete_report(report_id: str) -> dict:
    """Delete a report and its knowledge base."""
    deleted = await job_store.delete_report(report_id)
    if not deleted:
        raise HTTPException(404, f"Report {report_id} not found.")
        
    # Cleanup vector store
    VectorStoreManager.delete_collection(collection_name_for_report(report_id))
    logger.info("Deleted report and knowledge base for %s", report_id)
    
    return {"status": "deleted", "id": report_id}


@router.get("/report/{report_id}/export/json")
async def export_report_json(report_id: str) -> JSONResponse:
    """Export raw report JSON."""
    report = await job_store.get_report_async(report_id)
    if not report:
        raise HTTPException(404, "Report not found.")
    
    return JSONResponse(
        content=report.model_dump(),
        headers={
            "Content-Disposition": f"attachment; filename=nexus_report_{report.company_name.lower().replace(' ', '_')}.json"
        }
    )


@router.get("/report/{report_id}/export/pdf")
async def export_report_pdf(report_id: str) -> StreamingResponse:
    """Export report as PDF using WeasyPrint."""
    report = await job_store.get_report_async(report_id)
    if not report:
        raise HTTPException(404, "Report not found.")
        
    try:
        from weasyprint import HTML
        
        # Super simple HTML template for the PDF (can be expanded later)
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; }}
                h1 {{ color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }}
                h2 {{ color: #2b6cb0; margin-top: 30px; }}
                .overview {{ background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }}
            </style>
        </head>
        <body>
            <h1>Nexus Intelligence Report: {report.company_name}</h1>
            <p>Generated at: {report.generated_at.strftime('%Y-%m-%d %H:%M')}</p>
            
            <div class="overview">
                <h2>Executive Summary</h2>
                <p>{report.ai_summary.executive_summary}</p>
            </div>
            
            <h2>Company Overview</h2>
            <p>{report.overview.description}</p>
            <p><strong>Website:</strong> {report.overview.website}</p>
            <p><strong>Industry:</strong> {report.overview.industry}</p>
            
            <h2>Business Model</h2>
            <p>{report.business_model.summary}</p>
            
            <h2>Market Analysis</h2>
            <p>{report.market_analysis.market_position}</p>
            
            <h2>Competitors</h2>
            <ul>
                {"".join(f"<li><strong>{c.name}:</strong> {c.overview}</li>" for c in report.competitors[:5])}
            </ul>
        </body>
        </html>
        """
        
        pdf_bytes = HTML(string=html_content).write_pdf()
        
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=nexus_report_{report.company_name.lower().replace(' ', '_')}.pdf"
            }
        )
    except Exception as e:
        logger.error("PDF export failed: %s", e)
        raise HTTPException(500, f"Failed to generate PDF: {e}")
