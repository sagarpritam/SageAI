"""
FastAPI Router for Zero-Trust Workload Identity Fabric (SPIFFE/SPIRE & Cilium eBPF L7).
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.workload_identity.spiffe_spire_service import (
    spiffe_spire_service,
)

router = APIRouter(
    prefix="/workload-identity",
    tags=["Workload Identity & SPIFFE/SPIRE"],
)


class IssueSvidRequest(BaseModel):
    namespace: Optional[str] = "prod"
    service_account: str = Field(..., description="Kubernetes service account or workload identifier")
    enclave_attested: Optional[bool] = True


class EvaluateL7PolicyRequest(BaseModel):
    source_spiffe_id: str
    destination_spiffe_id: str
    http_method: Optional[str] = "POST"
    http_path: Optional[str] = "/v1/charge"


class RevokeSvidRequest(BaseModel):
    svid_id: str


@router.get("/svids")
@limiter.limit("60/minute")
async def list_svids_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all active issued X.509 SVID certificates."""
    return {"status": "success", "svids": spiffe_spire_service.list_active_svids()}


@router.post("/issue-svid")
@limiter.limit("30/minute")
async def issue_svid_endpoint(
    request: Request,
    payload: IssueSvidRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Issues a rotating 60-minute X.509 SVID for an attested workload."""
    return spiffe_spire_service.issue_svid(
        namespace=payload.namespace or "prod",
        service_account=payload.service_account,
        enclave_attested=payload.enclave_attested if payload.enclave_attested is not None else True,
        operator=current_user.get("email", "SPIREServer"),
    )


@router.post("/evaluate-l7")
@limiter.limit("60/minute")
async def evaluate_l7_endpoint(
    request: Request,
    payload: EvaluateL7PolicyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Evaluates Cilium in-kernel eBPF Layer-7 mTLS authorization policy."""
    return spiffe_spire_service.evaluate_cilium_l7_policy(
        source_spiffe_id=payload.source_spiffe_id,
        destination_spiffe_id=payload.destination_spiffe_id,
        http_method=payload.http_method or "POST",
        http_path=payload.http_path or "/v1/charge",
    )


@router.post("/revoke-svid")
@limiter.limit("30/minute")
async def revoke_svid_endpoint(
    request: Request,
    payload: RevokeSvidRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Revokes a compromised SVID certificate and updates eBPF kernel maps."""
    try:
        return spiffe_spire_service.revoke_svid(
            svid_id=payload.svid_id,
            operator=current_user.get("email", "SecOpsIdentityLead"),
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

