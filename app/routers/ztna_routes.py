"""
FastAPI Router for Zero-Trust Network Access (ZTNA) & Micro-Segmentation.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.ztna.microsegmentation_service import ztna_service

router = APIRouter(prefix="/ztna", tags=["Zero-Trust Network Access & Micro-Segmentation"])


class ContextualTrustRequest(BaseModel):
    session_context: Dict[str, Any] = Field(..., description="Device posture, authentication, and behavioral signals")


class MicrosegmentationPolicyRequest(BaseModel):
    source_service: str = Field(..., description="Source microservice name")
    target_service: str = Field(..., description="Target microservice name")
    allowed_ports: List[int] = Field(..., description="Explicit allowed ports")
    protocol: Optional[str] = Field("TCP", description="Network protocol")


@router.post("/evaluate-trust")
@limiter.limit("60/minute")
async def evaluate_contextual_trust(
    request: Request,
    payload: ContextualTrustRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Evaluates real-time contextual trust score (0 - 100) and access tier grant.
    """
    org_id = str(current_user.get("org", "system"))
    user_id = str(current_user.get("sub", "ZTNA-Engine"))

    result = ztna_service.evaluate_contextual_trust(
        session_context=payload.session_context,
        org_id=org_id,
        actor=user_id,
    )
    return result


@router.post("/synthesize-policy")
@limiter.limit("30/minute")
async def synthesize_microsegmentation_policy(
    request: Request,
    payload: MicrosegmentationPolicyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Synthesizes Kubernetes Cilium L7 NetworkPolicy to block lateral movement."""
    policy = ztna_service.generate_microsegmentation_policy(
        source_service=payload.source_service,
        target_service=payload.target_service,
        allowed_ports=payload.allowed_ports,
        protocol=payload.protocol or "TCP",
    )
    return {
        "status": "success",
        "policy": policy,
    }

