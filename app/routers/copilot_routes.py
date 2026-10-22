"""AI Security Copilot & Threat Feed Router.

Provides token streaming, tenant-scoped investigations, CISA KEV threat feeds,
vulnerability explanations, and safe PoC curl generation.
"""

import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.copilot import copilot_agent
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.audit_service import log_audit_event
from app.services.threat_feed.cve_indexer import cve_indexer

logger = logging.getLogger("SageAI.copilot_routes")

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])
threat_feed_router = APIRouter(prefix="/threat-feed", tags=["Threat Intelligence Feed"])


# ─────────────────────────────────────────────────────────────
# Request / Response Schemas
# ─────────────────────────────────────────────────────────────

class CopilotChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    context: Optional[Dict[str, Any]] = None
    stream: bool = False
    history: Optional[List[Dict[str, str]]] = None


class CopilotChatResponse(BaseModel):
    reply: str
    sources: List[Dict[str, Any]] = []


class VulnerabilityExplainRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    finding_id: Optional[str] = None


class PoCGenerateRequest(BaseModel):
    vulnerability_type: str = Field(..., min_length=1, max_length=200)
    target: Optional[str] = None
    finding_id: Optional[str] = None


# ─────────────────────────────────────────────────────────────
# Copilot Endpoints
# ─────────────────────────────────────────────────────────────

@router.post("/chat")
async def copilot_chat(
    req: CopilotChatRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Interactive AI Security Copilot chat endpoint.
    Supports Server-Sent Events (SSE) token streaming when `stream=True`
    or returns standard JSON response when `stream=False`.
    """
    org_id = current_user.get("org", "system")
    user_id = current_user.get("sub")
    client_ip = request.client.host if request.client else None

    # Record tamper-evident audit trail for copilot queries
    await log_audit_event(
        db=db,
        organization_id=str(org_id),
        action="COPILOT_QUERY",
        resource_type="copilot",
        user_id=user_id,
        details={"message_len": len(req.message), "has_context": bool(req.context), "streaming": req.stream},
        ip_address=client_ip,
    )

    if req.stream:
        # Return SSE StreamingResponse
        generator = copilot_agent.stream_chat(
            message=req.message,
            org_id=str(org_id),
            db=db,
            context=req.context,
            history=req.history,
        )
        return StreamingResponse(
            generator,
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    # Standard synchronous JSON completion
    result = await copilot_agent.chat(
        message=req.message,
        org_id=str(org_id),
        db=db,
        context=req.context,
        history=req.history,
    )
    return CopilotChatResponse(
        reply=result.get("reply", ""),
        sources=result.get("sources", []),
    )


@router.post("/explain")
async def explain_vulnerability(
    req: VulnerabilityExplainRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Dedicated vulnerability explanation endpoint.
    Enriches query with CISA KEV, CVSS, and OWASP Top 10 data.
    """
    org_id = current_user.get("org", "system")
    explanation = await copilot_agent.explain_vulnerability(
        cve_or_title=req.query,
        finding_id=req.finding_id,
        org_id=str(org_id),
        db=db,
    )

    if not explanation.get("authorized", True):
        raise HTTPException(status_code=403, detail=explanation.get("error", "Access denied."))

    return explanation


@router.post("/poc")
async def generate_safe_poc(
    req: PoCGenerateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate safe, non-destructive curl verification commands with domain safety check.
    """
    org_id = current_user.get("org", "system")
    poc = await copilot_agent.generate_poc_curl(
        vulnerability_type=req.vulnerability_type,
        target=req.target,
        finding_id=req.finding_id,
        org_id=str(org_id),
        db=db,
    )

    if not poc.get("authorized", True):
        raise HTTPException(status_code=403, detail=poc.get("error", "Access denied."))

    return poc


@router.get("/threat-intel")
async def get_threat_intel(
    query: str = Query(default="", description="Search CVE, product, or keyword"),
    limit: int = Query(default=10, ge=1, le=50),
    kev_only: bool = Query(default=False, description="Filter for CISA KEV actively exploited only"),
    current_user: dict = Depends(get_current_user),
):
    """Search live CISA KEV and indexed CVE threat intelligence."""
    results = copilot_agent.query_threat_intel(query=query, limit=limit, kev_only=kev_only)
    return {
        "count": len(results),
        "results": results,
        "indexer_stats": cve_indexer.stats(),
    }


@router.get("/tools")
async def list_copilot_tools(current_user: dict = Depends(get_current_user)):
    """List available tenant-scoped tools for SageAI Copilot."""
    return {
        "tools": [
            {
                "name": "get_scan_summary",
                "description": "Fetch status, risk score, and finding counts for a scan belonging to the tenant.",
                "scope": "tenant-isolated",
            },
            {
                "name": "explain_vulnerability",
                "description": "Deep technical explanation enriched with CISA KEV exploitation status and OWASP categories.",
                "scope": "public & tenant-finding",
            },
            {
                "name": "generate_poc_curl",
                "description": "Generate safe non-destructive curl commands to verify finding presence on verified targets.",
                "scope": "tenant-verified",
            },
            {
                "name": "query_threat_intel",
                "description": "Live lookup in CISA KEV catalog for actively exploited vulnerabilities and ransomware.",
                "scope": "global-threat-feed",
            },
        ]
    }


# ─────────────────────────────────────────────────────────────
# Threat Feed Router (Used by Dashboard & ThreatFeed component)
# ─────────────────────────────────────────────────────────────

@threat_feed_router.get("")
async def get_recent_threat_feed(
    limit: int = Query(default=20, ge=1, le=100),
    kev_only: bool = Query(default=False),
    current_user: dict = Depends(get_current_user),
):
    """
    Get live threat intelligence items for the dashboard and ThreatFeed widget.
    Format is 100% compatible with frontend ThreatFeed.
    """
    threats = cve_indexer.get_recent(limit=limit, kev_only=kev_only)
    feed_items = []
    for t in threats:
        feed_items.append({
            "id": t.id,
            "title": t.title,
            "severity": t.severity,
            "source": t.source,
            "published": t.published,
            "url": t.url or f"https://nvd.nist.gov/vuln/detail/{t.id}",
            "is_kev": t.is_kev,
            "ransomware": t.ransomware_campaign,
        })
    return feed_items


@threat_feed_router.post("/sync")
async def trigger_threat_feed_sync(
    force: bool = Query(default=False),
    current_user: dict = Depends(get_current_user),
):
    """Trigger background or on-demand synchronization of CISA KEV feed."""
    count = await cve_indexer.sync_cisa_kev(force=force)
    return {
        "status": "success",
        "synced_count": count,
        "stats": cve_indexer.stats(),
    }
