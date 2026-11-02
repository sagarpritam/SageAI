"""
Deception & Honeypot Management API Routes.
"""

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.services.deception.honeypot_service import honeypot_service
from app.services.incident_response.soar_engine import soar_engine

router = APIRouter(prefix="/deception", tags=["Deception & Honeypots"])


class CanaryTokenCreateRequest(BaseModel):
    token_type: str = Field("api_key", description="api_key or aws_key")
    label: str = Field("Production Database API Key", description="Description/location of lure")


class DecoyHitRequest(BaseModel):
    path: str
    source_ip: str
    user_agent: Optional[str] = "unknown"
    payload: Optional[str] = None


@router.get("/decoys")
async def list_decoys(current_user: dict = Depends(get_current_user)):
    """List all active deception decoy endpoints configured in SageAI."""
    return {
        "status": "success",
        "decoys": honeypot_service.get_decoy_endpoints(),
    }


@router.post("/canary")
async def create_canary_token(
    request: CanaryTokenCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate a high-fidelity canary credential (honey-token)."""
    org_id = current_user.get("org_id", "system")
    token = honeypot_service.generate_canary_token(
        token_type=request.token_type,
        label=request.label,
        org_id=org_id,
    )
    return {
        "status": "success",
        "canary_token": token,
    }


@router.post("/probe")
async def record_decoy_hit(
    request: DecoyHitRequest,
    current_user: dict = Depends(get_current_user),
):
    """Record a detected probe on a decoy honeypot endpoint and escalate to SOAR."""
    event = honeypot_service.record_decoy_hit(
        path=request.path,
        source_ip=request.source_ip,
        user_agent=request.user_agent or "unknown",
        payload=request.payload,
        org_id=current_user.get("org_id", "system"),
    )

    # Automatically create a Critical Incident in SOAR
    incident = soar_engine.create_incident(
        title=f"Honeypot Decoy Hit on {request.path}",
        severity="CRITICAL",
        source="Honeypot Decoy Service",
        details=event,
        org_id=current_user.get("org_id", "system"),
    )

    return {
        "status": "alert_triggered",
        "event": event,
        "incident_id": incident["incident_id"],
    }


@router.get("/alerts")
async def get_deception_alerts(
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve recent deception alerts."""
    return {
        "status": "success",
        "alerts": honeypot_service.get_recent_alerts(limit=limit),
    }
