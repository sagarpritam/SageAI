from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.scan import Scan
from app.models.organization import Organization
from app.models.finding import Finding
from app.schemas.scan import (
    ScanRequest,
    ScanResponse,
    ScanListItem,
    Vulnerability,
    RiskSummary,
)
from app.services.scanner_service import run_all_scans
from app.services.risk_engine import calculate_risk
from app.services.subscription import check_scan_limit, get_plan
from app.core.rate_limit import limiter
from app.agents.analyzer import analyze_findings

router = APIRouter(prefix="/scan", tags=["Scanning"])


@router.post("", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
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

    # Check scan limit based on org's plan (current calendar month only)
    org_result = await db.execute(
        select(Organization).where(Organization.id == current_user["org"])
    )
    org = org_result.scalar_one_or_none()
    if org:
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
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)

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

    return ScanResponse(
        id=scan.id,
        target=scan.target,
        status=scan.status,
        timestamp=scan.created_at,
        findings=[Vulnerability(**f) for f in formatted_findings]
        if formatted_findings
        else [],
        risk_summary=RiskSummary(**risk),
    )


@router.get("/{scan_id}", response_model=ScanResponse)
@limiter.limit("30/minute")
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
                "recommendations": []
            }
        
        nodes = [{"id": "target", "name": scan.target, "val": 20, "type": "domain", "color": "#10b981"}]
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
                color = "#ef4444" if f.get("severity", "Low").lower() in ["high", "critical"] else "#eab308"

            nodes.append({
                "id": node_id, 
                "name": f_type, 
                "val": 10, 
                "type": ntype, 
                "color": color,
                "data": f if isinstance(f, dict) else dict(f)
            })
            links.append({"source": "target", "target": node_id})
        graph_data = {"nodes": nodes, "links": links}

    return ScanResponse(
        id=scan.id,
        target=scan.target,
        status=scan.status,
        timestamp=scan.created_at,
        findings=[Vulnerability(**f) for f in findings],
        analyzed_findings=[f for f in findings],
        risk_summary=RiskSummary(**risk),
        report=report_data,
        graph=graph_data
    )


@router.get("/{scan_id}/report")
@limiter.limit("10/minute")
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
                "recommendations": ["Target appears clean. Schedule periodic re-scans."],
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
@limiter.limit("30/minute")
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
            "severity": f.severity,
            "cvss_score": f.cvss_score,
            "asset_identified": f.asset_identified,
            "created_at": f.created_at,
        }
        for f in findings
    ]


@router.get("s", response_model=list[ScanListItem])
@limiter.limit("30/minute")
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
            created_at=s.created_at,
        )
        for s in scans
    ]


@router.get("/{scan_id}/pdf")
@limiter.limit("10/minute")
async def download_pdf_report(
    request: Request,
    scan_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate and download a professional PDF security report."""
    from fastapi.responses import Response
    from app.services.report_generator import generate_pdf_report

    scan = await db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Service key bypasses org check because the Next.js proxy already validated the user session
    is_service = current_user.get("sub") == "clerk-proxy"
    if not is_service and str(scan.organization_id) != current_user["org"]:
        raise HTTPException(status_code=403, detail="Access denied")

    org = await db.get(Organization, scan.organization_id)
    if org and org.plan == "free":
        raise HTTPException(
            status_code=402,
            detail="PDF Export requires a Pro or Enterprise plan.",
        )

    # Fetch findings
    finding_rows = await db.execute(
        select(Finding).where(Finding.scan_id == scan_id)
    )
    findings = [
        {
            "type": f.finding_type,
            "severity": f.severity,
            "description": f.description,
            "cvss": getattr(f, "cvss_score", "N/A"),
        }
        for f in finding_rows.scalars().all()
    ]

    scan_data = {
        "id": str(scan.id),
        "target": scan.target,
        "risk_score": scan.risk_score or 0,
        "risk_level": scan.risk_level or "Low",
        "findings": findings,
        "created_at": str(scan.created_at),
    }

    pdf_bytes = generate_pdf_report(scan_data)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="sageai-report-{scan_id}.pdf"'
        },
    )

@router.post("/{scan_id}/share")
@limiter.limit("10/minute")
async def generate_share_link(
    request: Request,
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a unique public share token for a scan."""
    import uuid
    result = await db.execute(select(Scan).where(Scan.id == scan_id, Scan.organization_id == current_user["org"]))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    if not scan.share_token:
        scan.share_token = str(uuid.uuid4())
        await db.commit()
    
    return {"share_token": scan.share_token}

@router.get("/public/{share_token}")
@limiter.limit("30/minute")
async def get_public_scan(
    request: Request,
    share_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Fetch a scan's results publicly using its share token."""
    result = await db.execute(select(Scan).where(Scan.share_token == share_token))
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found or share link is invalid.")
        
    findings = scan.get_findings()
    risk = {"risk_score": scan.risk_score, "risk_level": scan.risk_level}
    
    # We only expose safe data publicly.
    return {
        "id": scan.id,
        "target": scan.target,
        "status": scan.status,
        "timestamp": scan.created_at,
        "risk_summary": risk,
        "findings": findings
    }
