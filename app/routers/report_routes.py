import io
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.models.organization import Organization
from app.models.scan import Scan
from app.services.report_generator import (
    generate_hackerone_report,
    generate_pdf_report,
    generate_report,
)
from app.services.reporting.multilingual_debrief import multilingual_debrief_service
from app.services.sarif_generator import generate_sarif_bytes

router = APIRouter(prefix="/reports", tags=["Reports"])


class ExecutiveDebriefRequest(BaseModel):
    target: str = Field(..., description="Target domain, URL, or asset name")
    risk_score: float = Field(default=0.0, ge=0.0, le=100.0)
    findings: List[Dict[str, Any]] = Field(default_factory=list)
    lang: str = Field(
        default="en", description="Language code: en, ja, de, fr, es, zh, ar"
    )


async def _check_export_plan(current_user: dict, db: AsyncSession):
    """Raise 402 if the user's org is on the free plan."""
    org_result = await db.execute(
        select(Organization).where(Organization.id == current_user["org"])
    )
    org = org_result.scalar_one_or_none()
    if org and getattr(org, "plan", "free") == "free":
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Export requires a Pro or Enterprise plan.",
        )


@router.get("/languages")
async def get_debrief_languages():
    """List supported multilingual languages for CISO board debriefs."""
    return {
        "status": "success",
        "languages": multilingual_debrief_service.SUPPORTED_LANGUAGES,
    }


@router.post("/executive-debrief")
@limiter.limit("60/minute")
async def generate_executive_debrief(
    request: Request,
    payload: ExecutiveDebriefRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate on-demand multilingual executive CISO debrief for any target & findings."""
    return multilingual_debrief_service.generate_debrief(
        target=payload.target,
        risk_score=payload.risk_score,
        findings=payload.findings,
        lang=payload.lang,
        org_id=current_user.get("org", "system"),
    )


@router.get("/{scan_id}")
@limiter.limit("120/minute")
async def get_report_json(
    request: Request,
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a JSON report for a completed scan."""
    scan = await _get_scan(scan_id, current_user, db)

    return generate_report(
        {
            "id": scan.id,
            "target": scan.target,
            "risk_score": scan.risk_score,
            "risk_level": scan.risk_level,
            "findings": scan.get_findings(),
        }
    )


@router.get("/{scan_id}/debrief")
@limiter.limit("60/minute")
async def get_report_debrief(
    request: Request,
    scan_id: str,
    lang: str = "en",
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate an internationalized CISO & Board debrief for a scan in one of 7 languages:
    en (English), ja (Japanese), de (German), fr (French), es (Spanish), zh (Chinese), ar (Arabic).
    """
    scan = await _get_scan(scan_id, current_user, db)
    return multilingual_debrief_service.generate_debrief(
        target=scan.target,
        risk_score=scan.risk_score,
        findings=scan.get_findings(),
        lang=lang,
        org_id=current_user.get("org", "system"),
    )


@router.get("/{scan_id}/pdf")
@limiter.limit("60/minute")
async def get_report_pdf(
    request: Request,
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download a professional PDF security report for a completed scan."""
    await _check_export_plan(current_user, db)
    scan = await _get_scan(scan_id, current_user, db)

    pdf_bytes = generate_pdf_report(
        {
            "id": scan.id,
            "target": scan.target,
            "risk_score": scan.risk_score,
            "risk_level": scan.risk_level,
            "findings": scan.get_findings(),
            "created_at": str(scan.created_at),
        }
    )

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=SageAI_report_{scan_id[:8]}.pdf"
        },
    )


@router.get("/{scan_id}/hackerone")
@limiter.limit("60/minute")
async def get_hackerone_report(
    request: Request,
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download a HackerOne-formatted Markdown report for Bug Bounty submission."""
    await _check_export_plan(current_user, db)
    scan = await _get_scan(scan_id, current_user, db)

    markdown = generate_hackerone_report(
        {
            "target": scan.target,
            "findings": scan.get_findings(),
        }
    )

    return StreamingResponse(
        io.BytesIO(markdown.encode("utf-8")),
        media_type="text/markdown",
        headers={
            "Content-Disposition": f"attachment; filename=hackerone_{scan_id[:8]}.md"
        },
    )


async def _get_scan(scan_id: str, current_user: dict, db: AsyncSession) -> Scan:
    """Shared helper — fetch scan scoped to user's organization."""
    result = await db.execute(
        select(Scan).where(
            Scan.id == scan_id,
            Scan.organization_id == current_user["org"],
        )
    )
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found"
        )

    if scan.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Scan is '{scan.status}', not 'completed'.",
        )

    return scan


@router.get("/{scan_id}/sarif")
@limiter.limit("60/minute")
async def get_report_sarif(
    request: Request,
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download a SARIF 2.1.0 report for CI/CD ingestion (GitHub, GitLab, Azure DevOps)."""
    await _check_export_plan(current_user, db)
    scan = await _get_scan(scan_id, current_user, db)

    sarif_bytes = generate_sarif_bytes(
        {
            "id": scan.id,
            "target": scan.target,
            "risk_score": scan.risk_score,
            "risk_level": scan.risk_level,
            "findings": scan.get_findings(),
            "created_at": str(scan.created_at),
        }
    )

    return StreamingResponse(
        io.BytesIO(sarif_bytes),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=SageAI_sarif_{scan_id[:8]}.sarif.json"
        },
    )
