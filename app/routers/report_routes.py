from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import io

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.scan import Scan
from app.services.report_generator import generate_report, generate_pdf_report, generate_hackerone_report

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/{scan_id}")
async def get_report_json(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a JSON report for a completed scan."""
    scan = await _get_scan(scan_id, current_user, db)

    return generate_report({
        "id": scan.id,
        "target": scan.target,
        "risk_score": scan.risk_score,
        "risk_level": scan.risk_level,
        "findings": scan.get_findings(),
    })


@router.get("/{scan_id}/pdf")
async def get_report_pdf(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download a professional PDF security report for a completed scan."""
    scan = await _get_scan(scan_id, current_user, db)

    pdf_bytes = generate_pdf_report({
        "id": scan.id,
        "target": scan.target,
        "risk_score": scan.risk_score,
        "risk_level": scan.risk_level,
        "findings": scan.get_findings(),
        "created_at": str(scan.created_at),
    })

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=SageAI_report_{scan_id[:8]}.pdf"
        },
    )


@router.get("/{scan_id}/hackerone")
async def get_hackerone_report(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download a HackerOne-formatted Markdown report for Bug Bounty submission."""
    scan = await _get_scan(scan_id, current_user, db)

    markdown = generate_hackerone_report({
        "target": scan.target,
        "findings": scan.get_findings(),
    })

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")

    if scan.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Scan is '{scan.status}', not 'completed'.",
        )

    return scan
