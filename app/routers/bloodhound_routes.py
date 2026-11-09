"""
FastAPI Router for Active Directory & BloodHound Attack Graph Engine.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.active_directory.bloodhound_service import bloodhound_service

router = APIRouter(
    prefix="/bloodhound", tags=["Active Directory & BloodHound Graph Engine"]
)


class GenerateLockdownRequest(BaseModel):
    risk_ids: Optional[List[str]] = Field(
        None, description="Optional list of risk IDs to target in lockdown script"
    )


@router.get("/topology")
@limiter.limit("60/minute")
async def get_ad_topology_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns the complete Windows Active Directory / Entra ID graph topology."""
    return {"status": "success", "topology": bloodhound_service.get_topology()}


@router.get("/scan")
@limiter.limit("60/minute")
async def scan_ad_risks_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Scans Active Directory domain for Kerberoasting, AS-REP Roasting, DCSync, and unconstrained delegation."""
    report = bloodhound_service.analyze_domain_risks()
    return {"status": "success", "ad_report": report}


@router.post("/generate-lockdown")
@limiter.limit("30/minute")
async def generate_lockdown_endpoint(
    request: Request,
    payload: GenerateLockdownRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates an automated PowerShell script to remediate discovered Active Directory risks."""
    try:
        script = bloodhound_service.generate_lockdown_script(risk_ids=payload.risk_ids)
        return {"status": "success", "lockdown_script": script}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
