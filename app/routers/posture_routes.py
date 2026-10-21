"""SageAI Defensive Security Shield — Posture API Routes.

Endpoints:
  GET /api/posture/score          — Current posture score + grade + breakdown
  GET /api/posture/trends         — Historical 30-day posture trend
  GET /api/posture/compliance/{fw} — Per-framework compliance report
  GET /api/posture/remediation/{scan_id} — Prioritized remediation plan
  GET /api/posture/quick-wins/{scan_id}  — Top quick-win fixes
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.models.scan import Scan
from app.services.compliance_mapper import (
    calculate_all_compliance,
    calculate_framework_compliance,
)
from app.services.posture_engine import (
    calculate_posture,
    calculate_posture_trends,
    posture_delta,
)
from app.services.remediation_engine import (
    get_quick_wins,
    prioritize_remediations,
)

router = APIRouter(prefix="/posture", tags=["Security Posture"])
compliance_router = APIRouter(prefix="/compliance", tags=["Compliance"])


@compliance_router.get("/report")
@limiter.limit("30/minute")
async def get_compliance_report(
    request: Request,
    framework: str = "soc2",
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Direct compliance report endpoint supporting ?framework= parameter."""
    return await get_framework_compliance(request, framework, current_user, db)


@router.get("/compliance/report")
@limiter.limit("30/minute")
async def get_compliance_report_alias(
    request: Request,
    framework: str = "soc2",
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Alias for /posture/compliance supporting ?framework= parameter."""
    return await get_framework_compliance(request, framework, current_user, db)


async def _get_org_scans(
    current_user: dict,
    db: AsyncSession,
    limit: int = 50,
) -> list[Scan]:
    """Fetch completed scans for the user's organization."""
    result = await db.execute(
        select(Scan)
        .where(
            Scan.organization_id == current_user["org"],
            Scan.status == "completed",
        )
        .order_by(desc(Scan.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())


@router.get("/score")
@limiter.limit("60/minute")
async def get_posture_score(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current security posture score with category breakdown.

    Calculated from the most recent completed scan.
    """
    scans = await _get_org_scans(current_user, db, limit=2)

    if not scans:
        return {
            "posture_score": 100,
            "grade": "A+",
            "grade_color": "#22C55E",
            "categories": {},
            "total_findings": 0,
            "severity_distribution": {},
            "delta": {"delta": 0, "direction": "new", "label": "No scans yet"},
            "scan_id": None,
        }

    latest = scans[0]
    findings = latest.get_findings()
    posture = calculate_posture(findings)

    # Calculate delta with previous scan
    previous_score = None
    if len(scans) > 1:
        prev_findings = scans[1].get_findings()
        prev_posture = calculate_posture(prev_findings)
        previous_score = prev_posture["posture_score"]

    delta = posture_delta(posture["posture_score"], previous_score)

    return {
        **posture,
        "delta": delta,
        "scan_id": latest.id,
        "target": latest.target,
        "scanned_at": str(latest.created_at),
    }


@router.get("/trends")
@limiter.limit("30/minute")
async def get_posture_trends(
    request: Request,
    days: int = Query(default=30, ge=7, le=90),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get historical posture trend data over the last N days."""
    scans = await _get_org_scans(current_user, db, limit=100)

    scan_dicts = [
        {
            "findings": scan.get_findings(),
            "created_at": str(scan.created_at),
        }
        for scan in scans
    ]

    trends = calculate_posture_trends(scan_dicts, days=days)

    return {
        "period_days": days,
        "data_points": len(trends),
        "trends": trends,
    }


@router.get("/compliance")
@limiter.limit("30/minute")
async def get_all_compliance(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get compliance scores across all supported frameworks.

    Based on the most recent completed scan.
    """
    scans = await _get_org_scans(current_user, db, limit=1)

    if not scans:
        return {
            "overall_score": 100,
            "overall_status": "compliant",
            "frameworks": {},
            "message": "No scans yet. Run a scan to generate compliance data.",
        }

    findings = scans[0].get_findings()
    compliance = calculate_all_compliance(findings)

    return {
        **compliance,
        "scan_id": scans[0].id,
        "target": scans[0].target,
    }


@router.get("/compliance/{framework}")
@limiter.limit("30/minute")
async def get_framework_compliance(
    request: Request,
    framework: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed compliance report for a specific framework.

    Supported: owasp, pci_dss, soc2, nist, iso27001
    """
    valid = {"owasp", "pci_dss", "soc2", "nist", "iso27001"}
    if framework not in valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown framework '{framework}'. Valid: {', '.join(sorted(valid))}",
        )

    scans = await _get_org_scans(current_user, db, limit=1)

    if not scans:
        return {"error": "No completed scans found."}

    findings = scans[0].get_findings()
    report = calculate_framework_compliance(findings, framework)

    return {
        **report,
        "scan_id": scans[0].id,
        "target": scans[0].target,
    }


@router.get("/remediation/{scan_id}")
@limiter.limit("20/minute")
async def get_remediation_plan(
    request: Request,
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a prioritized remediation plan for a specific scan."""
    result = await db.execute(
        select(Scan).where(
            Scan.id == scan_id,
            Scan.organization_id == current_user["org"],
        )
    )
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    if scan.status != "completed":
        raise HTTPException(
            status_code=400, detail=f"Scan is '{scan.status}', not 'completed'."
        )

    findings = scan.get_findings()
    plan = prioritize_remediations(findings)

    return {
        "scan_id": scan.id,
        "target": scan.target,
        "total_items": len(plan),
        "remediations": plan,
    }


@router.get("/quick-wins/{scan_id}")
@limiter.limit("30/minute")
async def get_quick_wins_endpoint(
    request: Request,
    scan_id: str,
    max_items: int = Query(default=5, ge=1, le=20),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the top quick-win remediations (high impact, low effort)."""
    result = await db.execute(
        select(Scan).where(
            Scan.id == scan_id,
            Scan.organization_id == current_user["org"],
        )
    )
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    findings = scan.get_findings()
    wins = get_quick_wins(findings, max_items=max_items)

    return {
        "scan_id": scan.id,
        "target": scan.target,
        "quick_wins": wins,
    }
