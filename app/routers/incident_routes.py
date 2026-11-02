"""
Incident Response & Reverse Engineering API Routes.
"""

import base64

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.services.incident_response.soar_engine import soar_engine
from app.services.malware.reverse_engineer import ReverseEngineeringEngine

router = APIRouter(prefix="/incidents", tags=["Incident Response & Forensics"])
rev_engine = ReverseEngineeringEngine()


class ActionExecutionRequest(BaseModel):
    action: str = Field(..., description="Action name to execute")


class ReverseEngineerRequest(BaseModel):
    filename: str = Field("payload.bin", description="Name of sample")
    base64_data: str = Field(..., description="Base64-encoded raw binary data")


@router.get("")
async def list_incidents(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    """List active security incidents prioritized by severity."""
    org_id = current_user.get("org_id", "system")
    return {
        "status": "success",
        "incidents": soar_engine.list_incidents(limit=limit, org_id=org_id),
    }


@router.get("/{incident_id}")
async def get_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve details and audit timeline of a specific incident."""
    incident = soar_engine.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return {
        "status": "success",
        "incident": incident,
    }


@router.post("/{incident_id}/action")
async def execute_containment_action(
    incident_id: str,
    request: ActionExecutionRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Execute a defensive containment action with human-in-the-loop authorization.
    High-impact actions require 'admin', 'ciso', or 'owner' role.
    """
    user_email = current_user.get("email", "anonymous")
    user_role = current_user.get("role", "viewer")

    res = soar_engine.execute_high_impact_action(
        incident_id=incident_id,
        action_name=request.action,
        approved_by=user_email,
        role=user_role,
    )

    if res.get("status") == "BLOCKED_BY_SAFETY_POLICY":
        raise HTTPException(status_code=403, detail=res["message"])
    elif res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res["message"])

    return res


@router.post("/reverse-engineer")
async def reverse_engineer_sample(
    request: ReverseEngineerRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Disassemble and reverse engineer an uploaded suspicious binary/script in an isolated sandbox.
    """
    try:
        raw_bytes = base64.b64decode(request.base64_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Base64 payload encoding")

    # Safety constraint: enforce maximum analysis buffer size (10MB)
    if len(raw_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Payload exceeds 10MB analysis limit")

    analysis = rev_engine.analyze_binary(raw_bytes, filename=request.filename)
    return {
        "status": "success",
        "analysis": analysis,
    }
