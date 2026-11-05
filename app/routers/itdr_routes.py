"""
FastAPI Router for Identity Threat Detection & Response (ITDR).
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.itdr.itdr_service import itdr_service

router = APIRouter(prefix="/itdr", tags=["Identity Threat Detection & Response (ITDR)"])


class AnalyzeIdentityEventsRequest(BaseModel):
    events: Optional[List[Dict[str, Any]]] = Field(None, description="Custom identity events batch")


class ContainUserRequest(BaseModel):
    user_email: str = Field(..., description="Target compromised user email")
    action: Optional[str] = Field("REVOKE_SESSION_AND_ENFORCE_FIDO2", description="Containment action playbook")


@router.get("/telemetry")
@limiter.limit("60/minute")
async def get_identity_telemetry_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Analyzes default identity telemetry stream for impossible travel, MFA fatigue, and shadow admins."""
    report = itdr_service.analyze_identity_telemetry()
    return {"status": "success", "itdr_report": report}


@router.post("/analyze")
@limiter.limit("60/minute")
async def post_identity_analyze_endpoint(
    request: Request,
    payload: AnalyzeIdentityEventsRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Analyzes custom batch of identity events from Okta, Entra ID, or AWS IAM."""
    report = itdr_service.analyze_identity_telemetry(events=payload.events)
    return {"status": "success", "itdr_report": report}


@router.post("/contain")
@limiter.limit("30/minute")
async def contain_user_endpoint(
    request: Request,
    payload: ContainUserRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes an autonomous SOAR containment playbook against a compromised identity."""
    user_id = str(current_user.get("sub", "ITDR-Admin"))
    try:
        result = itdr_service.execute_containment_action(
            user_email=payload.user_email,
            action=payload.action or "REVOKE_SESSION_AND_ENFORCE_FIDO2",
            operator=user_id,
        )
        return {"status": "success", "containment_result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

