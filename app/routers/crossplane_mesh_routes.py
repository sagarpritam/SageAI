"""
FastAPI Router for Multi-Cloud Zero-Trust Cross-Plane Mesh.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.crossplane_mesh.crossplane_mesh_service import crossplane_mesh_service

router = APIRouter(
    prefix="/crossplane-mesh",
    tags=["Multi-Cloud Zero-Trust Cross-Plane Mesh"],
)


class TranslatePolicyRequest(BaseModel):
    name: str = Field(..., description="Policy name")
    intent_description: str = Field(..., description="High-level security intent")
    target_clouds: Optional[List[str]] = None
    target_port: Optional[int] = 443


class ReconcileDriftRequest(BaseModel):
    drift_id: str


@router.get("/nodes")
@limiter.limit("60/minute")
async def list_nodes_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all connected cross-cloud mesh topology nodes."""
    return {"status": "success", "nodes": crossplane_mesh_service.list_nodes()}


@router.get("/policies")
@limiter.limit("60/minute")
async def list_policies_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all translated cross-plane zero-trust policies."""
    return {"status": "success", "policies": crossplane_mesh_service.list_policies()}


@router.get("/policies/{policy_id}")
@limiter.limit("60/minute")
async def get_policy_endpoint(
    request: Request,
    policy_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific translated policy."""
    policy = crossplane_mesh_service.get_policy(policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"status": "success", "policy": policy}


@router.post("/translate-policy")
@limiter.limit("30/minute")
async def translate_policy_endpoint(
    request: Request,
    payload: TranslatePolicyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Translates a declarative security intent into native cloud firewall rules."""
    pol = crossplane_mesh_service.translate_and_deploy_policy(
        name=payload.name,
        intent_description=payload.intent_description,
        target_clouds=payload.target_clouds,
        target_port=payload.target_port or 443
    )
    return {"status": "success", "policy": pol}


@router.get("/drifts")
@limiter.limit("60/minute")
async def list_drifts_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves detected configuration drifts across multi-cloud network planes."""
    return {"status": "success", "drifts": crossplane_mesh_service.list_drifts()}


@router.post("/reconcile-drift")
@limiter.limit("30/minute")
async def reconcile_drift_endpoint(
    request: Request,
    payload: ReconcileDriftRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Atomically reconciles and purges unauthorized cloud firewall rules."""
    try:
        res = crossplane_mesh_service.reconcile_drift(payload.drift_id)
        return {"status": "success", "result": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/health")
@limiter.limit("60/minute")
async def get_mesh_health_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves multi-cloud cross-plane network health and latency telemetry."""
    return {"status": "success", "health": crossplane_mesh_service.get_mesh_health()}

