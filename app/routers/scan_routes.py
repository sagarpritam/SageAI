from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.scan import Scan
from app.models.organization import Organization
from app.models.finding import Finding
from app.schemas.scan import ScanRequest, ScanResponse, ScanListItem, Vulnerability, RiskSummary
from app.services.scanner_service import run_all_scans
from app.services.risk_engine import calculate_risk
from app.services.subscription import check_scan_limit

router = APIRouter(prefix="/scan", tags=["Scanning"])


@router.post("", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(
    payload: ScanRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run a security scan against a target URL and persist results."""

    if not payload.target.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target must be a valid URL starting with http:// or https://",
        )

    # Check scan limit based on org's plan
    org_result = await db.execute(
        select(Organization).where(Organization.id == current_user["org"])
    )
    org = org_result.scalar_one_or_none()
    if org:
        scan_count = await db.execute(
            select(func.count(Scan.id)).where(Scan.organization_id == org.id)
        )
        current_scans = scan_count.scalar() or 0
        if not check_scan_limit(org.plan, current_scans):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Scan limit reached for '{org.plan}' plan. Please upgrade.",
            )

    # Create scan record
    scan = Scan(
        target=payload.target,
        user_id=current_user["sub"],
        organization_id=current_user["org"],
        status="running",
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)

    # Run async scans
    formatted_findings = []
    try:
        findings_data = await run_all_scans(payload.target, scan_id=scan.id, db=db)
        risk = calculate_risk(findings_data)

        # Legacy JSON compliance
        scan.set_findings(findings_data)
        scan.risk_score = risk["risk_score"]
        scan.risk_level = risk["risk_level"]
        scan.status = "completed"

        # V2 compliance: Store in robust Findings table
        for f in findings_data:
            finding = Finding(
                scan_id=scan.id,
                title=f.get('type', 'Unknown Vulnerability'),
                description=f.get('description', ''),
                severity=f.get('severity', 'Low').capitalize(),
                cvss_score=f.get('cvss', 0.0),
                asset_identified=payload.target,
            )
            db.add(finding)
            formatted_findings.append(f)

    except Exception as e:
        scan.status = "failed"
        risk = {"risk_score": 0, "risk_level": "Low", "total_findings": 0}

    await db.commit()
    await db.refresh(scan)

    return ScanResponse(
        id=scan.id,
        target=scan.target,
        status=scan.status,
        timestamp=scan.created_at,
        findings=[Vulnerability(**f) for f in formatted_findings] if formatted_findings else [],
        risk_summary=RiskSummary(**risk),
    )


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a specific scan result (scoped to user's organization)."""

    result = await db.execute(
        select(Scan).where(
            Scan.id == scan_id,
            Scan.organization_id == current_user["org"],
        )
    )
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")

    findings = scan.get_findings()
    risk = calculate_risk(findings)

    return ScanResponse(
        id=scan.id,
        target=scan.target,
        status=scan.status,
        timestamp=scan.created_at,
        findings=[Vulnerability(**f) for f in findings],
        risk_summary=RiskSummary(**risk),
    )


@router.get("/{scan_id}/findings", response_model=list[dict])
async def get_scan_findings(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve granular findings linked to a specific scan."""
    
    # 1. Verify org ownership of scan
    result = await db.execute(
        select(Scan).where(
            Scan.id == scan_id,
            Scan.organization_id == current_user["org"],
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
        
    # 2. Extract detailed findings
    f_result = await db.execute(
        select(Finding).where(Finding.scan_id == scan_id).order_by(desc(Finding.severity))
    )
    findings = f_result.scalars().all()
    
    return [
        {
            "id": f.id,
            "title": f.title,
            "description": f.description,
            "severity": f.severity,
            "cvss_score": f.cvss_score,
            "asset_identified": f.asset_identified,
            "created_at": f.created_at
        }
        for f in findings
    ]


@router.get("s", response_model=list[ScanListItem])
async def list_scans(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all scans for the current user's organization (multi-tenant)."""

    result = await db.execute(
        select(Scan)
        .where(Scan.organization_id == current_user["org"])
        .order_by(Scan.created_at.desc())
    )
    scans = result.scalars().all()

    return [
        ScanListItem(
            id=s.id,
            target=s.target,
            status=s.status,
            risk_score=s.risk_score,
            risk_level=s.risk_level,
            created_at=s.created_at,
        )
        for s in scans
    ]

