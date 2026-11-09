"""
FastAPI Router for Autonomous SDN Ephemeral Network Isolation Engine.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.sdn_shield.sdn_isolation_engine import sdn_isolation_engine

router = APIRouter(prefix="/sdn-shield", tags=["SDN Ephemeral Network Isolation"])


class IsolateAssetRequest(BaseModel):
    asset_id: str = Field(..., description="Target asset ID, EC2 instance ID, or Pod name")
    asset_type: Optional[str] = Field("AWS_EC2", description="Asset type (AWS_EC2, AZURE_VM, K8S_POD)")
    reason: Optional[str] = Field("Active C2 beaconing detected", description="Isolation justification")
    redirect_to_honeynet: Optional[bool] = Field(True, description="Redirect traffic to deceptive honeynet")
    ttl_minutes: Optional[int] = Field(60, description="Quarantine duration in minutes")


class ReleaseAssetRequest(BaseModel):
    isolation_id: str = Field(..., description="Isolation record ID to release and restore")


@router.get("/isolations")
@limiter.limit("60/minute")
async def list_isolations_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Lists all active network quarantine isolations across AWS, Azure, and Kubernetes."""
    return {"status": "success", "active_isolations": sdn_isolation_engine.list_active_isolations()}


@router.post("/isolate")
@limiter.limit("30/minute")
async def isolate_asset_endpoint(
    request: Request,
    payload: IsolateAssetRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes sub-second host or container network isolation with SDN firewall automation."""
    user_id = str(current_user.get("sub", "SageAI-AutonomousSOAR"))
    try:
        rec = sdn_isolation_engine.isolate_asset(
            asset_id=payload.asset_id,
            asset_type=payload.asset_type or "AWS_EC2",
            reason=payload.reason or "Active security anomaly detected",
            redirect_to_honeynet=payload.redirect_to_honeynet if payload.redirect_to_honeynet is not None else True,
            ttl_minutes=payload.ttl_minutes or 60,
            operator=user_id,
        )
        return {"status": "success", "isolation_record": rec}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/release")
@limiter.limit("30/minute")
async def release_asset_endpoint(
    request: Request,
    payload: ReleaseAssetRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Releases an asset from quarantine and restores baseline network traffic."""
    user_id = str(current_user.get("sub", "SecOpsDirector"))
    try:
        res = sdn_isolation_engine.release_asset(
            isolation_id=payload.isolation_id,
            operator=user_id,
        )
        return {"status": "success", "result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

