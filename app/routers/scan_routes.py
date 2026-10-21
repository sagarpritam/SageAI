import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.analyzer import analyze_findings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.models.finding import Finding, FindingStatus
from app.models.organization import Organization
from app.models.scan import Scan
from app.schemas.scan import (
    RiskSummary,
    ScanListItem,
    ScanRequest,
    ScanResponse,
    Vulnerability,
)
from app.services.asset_inventory.verification_service import (
    extract_target_domain,
    is_target_authorized,
)
from app.services.audit_service import log_audit_event
from app.services.risk_engine import calculate_risk
from app.services.scanner_service import run_all_scans
from app.services.subscription import check_scan_limit, get_plan

router = APIRouter(prefix="/scan", tags=["Scanning"])
logger = logging.getLogger("SageAI.scan")


@router.post("", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_scan(
    request: Request,
    payload: ScanRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run a security scan against a target URL and persist results."""

    target_url = str(payload.target)
    if not target_url.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target must be a valid URL starting with http:// or https://",
        )

    # SSRF & Private IP Target Validation
    from app.routers.webhook_routes import is_safe_webhook_url

    is_safe, error_msg = is_safe_webhook_url(target_url)
    if not is_safe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Target URL is not permitted for scanning: {error_msg}",
        )

    # Asset Ownership Verification Check (including domain hierarchy)
    target_domain = extract_target_domain(target_url)
    is_authorized = await is_target_authorized(db, current_user["org"], target_url)

    # Check scan limit based on org's plan (current calendar month only)
    org_result = await db.execute(
        select(Organization).where(Organization.id == current_user["org"])
    )
    org = org_result.scalar_one_or_none()
    if org:
        # Enforce enterprise verified domains policy if enabled
        if getattr(org, "require_verified_domains", False) and not is_authorized:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Target domain '{target_domain}' is not verified. Your organization requires verified asset ownership prior to scanning.",
            )

        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        scan_count = await db.execute(
            select(func.count(Scan.id)).where(
                Scan.organization_id == org.id,
                Scan.created_at >= month_start,
            )
        )
        current_scans = scan_count.scalar() or 0
        if not check_scan_limit(org.plan, current_scans):
            plan_limits = get_plan(org.plan)
            max_scans = plan_limits["max_scans_per_month"]
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Monthly scan limit reached ({current_scans}/{max_scans}). Upgrade to Pro for unlimited scans.",
            )

    # Create scan record
    scan = Scan(
        target=target_url,
        user_id=current_user["sub"],
        organization_id=current_user["org"],
        status="running",
        is_authorized=is_authorized,
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)

    # Audit log scan initiation
    await log_audit_event(
        db=db,
        organization_id=current_user["org"],
        user_id=current_user.get("sub"),
        action="SCAN_STARTED",
        resource_type="scan",
        resource_id=scan.id,
        details={
            "target": target_url,
            "target_domain": target_domain,
            "is_authorized": is_authorized,
        },
        ip_address=request.client.host if request.client else None,
    )

    # Run async scans
    formatted_findings = []
    try:
        raw_findings = await run_all_scans(target_url, scan_id=scan.id, db=db)

        # Pass raw reconnaissance data to the AI agent to determine actual exploitability
        findings_data = analyze_findings(raw_findings)

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
                title=f.get("type", "Unknown Vulnerability"),
                description=f.get("description", ""),
                severity=f.get("severity", "Low").capitalize(),
                cvss_score=f.get("cvss", 0.0),
                asset_identified=target_url,
            )
            db.add(finding)
            formatted_findings.append(f)

    except Exception:
        scan.status = "failed"
        risk = {"risk_score": 0, "risk_level": "Low", "total_findings": 0}

    await db.commit()
    await db.refresh(scan)

    # Multi-channel alerting (Slack, Discord, Teams, Webhook)
    if scan.status == "completed" and scan.risk_level in ("Critical", "High", "Medium"):
        try:
            from app.services.alerting.dispatcher import dispatch_security_alert

            await dispatch_security_alert(
                db=db,
                organization_id=current_user["org"],
                title=f"Scan Completed: {scan.target} ({scan.risk_level} Risk)",
                target=str(scan.target),
                severity=scan.risk_level.lower(),
                risk_score=float(scan.risk_score or 0.0),
                details=f"Scan completed with {len(formatted_findings)} findings identified. Highest severity: {scan.risk_level}.",
                findings_count=len(formatted_findings),
                metadata={"scan_id": scan.id, "risk_score": scan.risk_score},
            )
        except Exception as alert_err:
            logger.warning(f"Failed to dispatch alerts for scan {scan.id}: {alert_err}")

    return ScanResponse(
        id=scan.id,
        target=scan.target,
        status=scan.status,
        timestamp=scan.created_at,
        findings=[Vulnerability(**f) for f in formatted_findings]
        if formatted_findings
        else [],
        risk_summary=RiskSummary(**risk),
        is_authorized=bool(scan.is_authorized),
    )


@router.get("/{scan_id}", response_model=ScanResponse)
@limiter.limit("60/minute")
async def get_scan(
    request: Request,
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found"
        )

    findings = scan.get_findings()
    risk = calculate_risk(findings)

    report_data = None
    graph_data = None

    if scan.status == "completed":
        from app.agents.reporter import create_report

        try:
            report_data = create_report(findings)
        except Exception:
            report_data = {
                "summary": "Report generation failed or not available.",
                "critical_issues": [],
                "recommendations": [],
            }

        nodes = [
            {
                "id": "target",
                "name": scan.target,
                "val": 20,
                "type": "domain",
                "color": "#10b981",
            }
        ]
        links = []
        for i, f in enumerate(findings):
            node_id = f"finding_{i}"
            f_module = f.get("module", "")
            f_type = f.get("type", "Finding")

            if f_module == "breach_intel":
                ntype = "breach"
                color = "#dc2626"
            elif "port" in f_type.lower() or f_module == "shodan":
                ntype = "port"
                color = "#3b82f6"
            elif f_module == "censys":
                ntype = "cert"
                color = "#a855f7"
            elif f_module == "darkweb":
                ntype = "darkweb"
                color = "#7e22ce"
            elif f_module == "urlhaus":
                ntype = "malware"
                color = "#f43f5e"
            elif f_module in ["spiderfoot", "recon_ng"]:
                ntype = "recon"
                color = "#9ca3af"
            elif f_module == "intelx":
                ntype = "archive"
                color = "#4f46e5"
            else:
                ntype = "vuln"
                color = (
                    "#ef4444"
                    if f.get("severity", "Low").lower() in ["high", "critical"]
                    else "#eab308"
                )

            nodes.append(
                {
                    "id": node_id,
                    "name": f_type,
                    "val": 10,
                    "type": ntype,
                    "color": color,
                    "data": f if isinstance(f, dict) else dict(f),
                }
            )
            links.append({"source": "target", "target": node_id})
        graph_data = {"nodes": nodes, "links": links}

    return ScanResponse(
        id=scan.id,
        target=scan.target,
        status=scan.status,
        timestamp=scan.created_at,
        findings=[Vulnerability(**f) for f in findings],
        analyzed_findings=list(findings),
        risk_summary=RiskSummary(**risk),
        report=report_data,
        graph=graph_data,
    )


@router.get("/{scan_id}/report")
@limiter.limit("30/minute")
async def get_scan_report(
    request: Request,
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate an AI executive report for a completed scan."""
    from app.agents.reporter import create_report

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
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Scan is still '{scan.status}'. Report is only available for completed scans.",
        )

    findings = scan.get_findings()
    if not findings:
        return {
            "scan_id": scan_id,
            "report": {
                "summary": "No findings to report.",
                "critical_issues": [],
                "recommendations": [
                    "Target appears clean. Schedule periodic re-scans."
                ],
            },
        }

    report = create_report(findings)
    return {
        "scan_id": scan_id,
        "target": scan.target,
        "risk_score": scan.risk_score,
        "risk_level": scan.risk_level,
        "report": report,
    }


@router.get("/{scan_id}/findings", response_model=list[dict])
@limiter.limit("60/minute")
async def get_scan_findings(
    request: Request,
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found"
        )

    # 2. Extract detailed findings
    f_result = await db.execute(
        select(Finding)
        .where(Finding.scan_id == str(scan_id))
        .order_by(desc(Finding.severity))
    )
    findings = f_result.scalars().all()

    return [
        {
            "id": f.id,
            "title": f.title,
            "description": f.description,
            "severity": f.severity.value
            if hasattr(f.severity, "value")
            else str(f.severity),
            "cvss_score": f.cvss_score,
            "status": f.status.value
            if hasattr(f.status, "value")
            else str(f.status),
            "assigned_to": f.assigned_to,
            "resolved_at": f.resolved_at.isoformat() if f.resolved_at else None,
            "notes": f.notes,
            "asset_identified": f.asset_identified,
            "created_at": f.created_at,
        }
        for f in findings
    ]


class FindingStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        description="Lifecycle status: new, confirmed, in_progress, fixed, accepted_risk, reopened",
    )
    assigned_to: str | None = None
    notes: str | None = None


@router.patch("/{scan_id}/findings/{finding_id}/status")
@limiter.limit("60/minute")
async def update_finding_status(
    request: Request,
    scan_id: str,
    finding_id: str,
    payload: FindingStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update lifecycle status of a finding with strict tenant verification and audit logging."""
    # 1. Enforce tenant isolation on parent scan
    scan_res = await db.execute(
        select(Scan).where(
            Scan.id == scan_id,
            Scan.organization_id == current_user["org"],
        )
    )
    scan = scan_res.scalar_one_or_none()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found"
        )

    # 2. Find finding linked to this scan
    f_res = await db.execute(
        select(Finding).where(
            Finding.id == finding_id,
            Finding.scan_id == scan_id,
        )
    )
    finding = f_res.scalar_one_or_none()
    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found"
        )

    # 3. Validate status
    try:
        new_status = FindingStatus(payload.status.lower().strip())
    except ValueError:
        valid_statuses = [s.value for s in FindingStatus]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid finding status '{payload.status}'. Allowed: {valid_statuses}",
        )

    old_status = (
        finding.status.value
        if hasattr(finding.status, "value")
        else str(finding.status)
    )
    finding.status = new_status
    if payload.assigned_to is not None:
        finding.assigned_to = payload.assigned_to
    if payload.notes is not None:
        finding.notes = payload.notes

    if new_status in (FindingStatus.fixed, FindingStatus.accepted_risk):
        finding.resolved_at = datetime.now(timezone.utc)
    elif new_status in (FindingStatus.new, FindingStatus.in_progress, FindingStatus.reopened):
        finding.resolved_at = None

    await db.commit()
    await db.refresh(finding)

    # 4. Record audit event
    await log_audit_event(
        db=db,
        organization_id=current_user["org"],
        user_id=current_user.get("sub"),
        action="FINDING_STATUS_CHANGED",
        resource_type="finding",
        resource_id=finding.id,
        details={
            "scan_id": scan_id,
            "old_status": old_status,
            "new_status": new_status.value,
            "assigned_to": finding.assigned_to,
        },
        ip_address=request.client.host if request.client else None,
    )

    return {
        "id": finding.id,
        "scan_id": finding.scan_id,
        "title": finding.title,
        "status": finding.status.value
        if hasattr(finding.status, "value")
        else str(finding.status),
        "assigned_to": finding.assigned_to,
        "resolved_at": finding.resolved_at.isoformat()
        if finding.resolved_at
        else None,
        "notes": finding.notes,
    }


@router.get("s", response_model=list[ScanListItem])
@limiter.limit("60/minute")
async def list_scans(
    request: Request,
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
            is_authorized=bool(s.is_authorized),
            created_at=s.created_at,
        )
        for s in scans
    ]


@router.post("/{scan_id}/share")
@limiter.limit("30/minute")
async def generate_share_link(
    request: Request,
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a unique public share token for a scan."""
    import uuid

    result = await db.execute(
        select(Scan).where(
            Scan.id == scan_id, Scan.organization_id == current_user["org"]
        )
    )
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    if not scan.share_token:
        scan.share_token = str(uuid.uuid4())
        await db.commit()

    return {"share_token": scan.share_token}


@router.get("/public/{share_token}")
@limiter.limit("60/minute")
async def get_public_scan(
    request: Request,
    share_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Fetch a scan's results publicly using its share token."""
    result = await db.execute(select(Scan).where(Scan.share_token == share_token))
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=404, detail="Scan not found or share link is invalid."
        )

    findings = scan.get_findings()
    risk = {"risk_score": scan.risk_score, "risk_level": scan.risk_level}

    # We only expose safe data publicly.
    return {
        "id": scan.id,
        "target": scan.target,
        "status": scan.status,
        "timestamp": scan.created_at,
        "risk_summary": risk,
        "findings": findings,
    }
