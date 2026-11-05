"""
FastAPI Router for Multi-Agent AI Incident Commander & Regulatory Disclosure.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.regulatory_commander.regulatory_commander_service import regulatory_incident_commander

router = APIRouter(
    prefix="/regulatory-commander",
    tags=["Multi-Agent AI Incident Commander & Regulatory Disclosures"],
)


class DeclareIncidentRequest(BaseModel):
    title: str = Field(..., description="Major security incident designation")
    severity: Optional[str] = "CRITICAL"
    impacted_systems: Optional[List[str]] = None
    records_compromised: Optional[int] = 10000


class Generate8KRequest(BaseModel):
    incident_id: str
    registrant_name: Optional[str] = "SageAI Sovereign Enterprise Corp"
    cik_number: Optional[str] = "0001984210"


class GenerateNIS2Request(BaseModel):
    incident_id: str
    member_state_csirt: Optional[str] = "BSI (Germany) / ANSSI (France)"


@router.get("/incidents")
@limiter.limit("60/minute")
async def list_incidents_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all major security incidents tracked by the Commander."""
    return {"status": "success", "incidents": regulatory_incident_commander.list_incidents()}


@router.get("/incidents/{incident_id}")
@limiter.limit("60/minute")
async def get_incident_endpoint(
    request: Request,
    incident_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific incident."""
    inc = regulatory_incident_commander.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"status": "success", "incident": inc}


@router.post("/declare-incident")
@limiter.limit("20/minute")
async def declare_incident_endpoint(
    request: Request,
    payload: DeclareIncidentRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Declares a major incident and triggers automated statutory deadline timers."""
    inc = regulatory_incident_commander.declare_incident(
        title=payload.title,
        severity=payload.severity or "CRITICAL",
        impacted_systems=payload.impacted_systems,
        records_compromised=payload.records_compromised or 10000
    )
    return {"status": "success", "incident": inc}


@router.post("/generate-sec-8k")
@limiter.limit("20/minute")
async def generate_sec_8k_endpoint(
    request: Request,
    payload: Generate8KRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Drafts an SEC Form 8-K Item 1.05 Material Cybersecurity Incident disclosure."""
    try:
        res = regulatory_incident_commander.generate_sec_8k_filing(
            incident_id=payload.incident_id,
            registrant_name=payload.registrant_name or "SageAI Sovereign Enterprise Corp",
            cik_number=payload.cik_number or "0001984210"
        )
        return {"status": "success", "filing": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/generate-nis2")
@limiter.limit("20/minute")
async def generate_nis2_endpoint(
    request: Request,
    payload: GenerateNIS2Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Drafts an EU NIS2 Directive Article 23 Early Warning Notice."""
    try:
        res = regulatory_incident_commander.generate_nis2_early_warning(
            incident_id=payload.incident_id,
            member_state_csirt=payload.member_state_csirt or "BSI (Germany) / ANSSI (France)"
        )
        return {"status": "success", "notice": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/ciso-brief/{incident_id}")
@limiter.limit("30/minute")
async def get_ciso_brief_endpoint(
    request: Request,
    incident_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves attorney-client privileged CISO & Board Executive Briefing."""
    try:
        res = regulatory_incident_commander.get_ciso_executive_brief(incident_id)
        return {"status": "success", "brief": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves regulatory incident commander metrics."""
    return {"status": "success", "metrics": regulatory_incident_commander.get_commander_metrics()}

