"""
FastAPI Router for Dark Web & Infostealer Intelligence Radar.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.infostealer.darkweb_radar import darkweb_radar_service

router = APIRouter(prefix="/darkweb-radar", tags=["Dark Web & Infostealer Intelligence Radar"])


class ScanDarkWebRequest(BaseModel):
    domain_filter: Optional[str] = Field("enterprise.io", description="Corporate domain to search in stealer bot logs")


class RevokeSessionRequest(BaseModel):
    token_hash: str = Field(..., description="Compromised session token hash to invalidate")
    user_identity: Optional[str] = Field("sarah.connor@enterprise.io", description="Victim employee email")


@router.get("/scan")
@limiter.limit("60/minute")
async def get_darkweb_scan_endpoint(
    request: Request,
    domain: Optional[str] = "enterprise.io",
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Scans dark web marketplaces and botnet dumps for compromised corporate credentials and active cookies."""
    report = darkweb_radar_service.scan_darkweb_telemetry(domain_filter=domain or "enterprise.io")
    return {"status": "success", "radar_report": report}


@router.post("/scan")
@limiter.limit("60/minute")
async def post_darkweb_scan_endpoint(
    request: Request,
    payload: ScanDarkWebRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes a dark web infostealer sweep for a specific corporate domain."""
    report = darkweb_radar_service.scan_darkweb_telemetry(domain_filter=payload.domain_filter or "enterprise.io")
    return {"status": "success", "radar_report": report}


@router.post("/revoke-token")
@limiter.limit("30/minute")
async def revoke_token_endpoint(
    request: Request,
    payload: RevokeSessionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Triggers autonomous session token invalidation across IdPs for a leaked credential."""
    user_id = str(current_user.get("sub", "SecOpsIdentityAdmin"))
    try:
        res = darkweb_radar_service.execute_session_invalidation(
            token_hash=payload.token_hash,
            user_identity=payload.user_identity or "employee@enterprise.io",
            operator=user_id,
        )
        return {"status": "success", "revocation_result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

