"""FastAPI Router for Capability 176: Perelman Ricci Flow with Surgery Shield."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.perelman_ricci_flow_shield.perelman_ricci_flow_shield import (
    get_perelman_ricci_flow_shield_service,
)

router = APIRouter(
    prefix="/api/perelman-ricci-flow",
    tags=["Capability 176: Perelman Ricci Flow Shield"],
)


class ExecuteSurgeryRequest(BaseModel):
    manifold_id: str = Field(..., description="ID of the 3-manifold")
    flow_time_tau: float = Field(
        default=0.5, ge=0.01, le=5.0, description="Ricci flow evolution time tau"
    )
    surgery_cutoff: float = Field(
        default=1e-4, ge=1e-8, le=1e-2, description="Singularity neck-pinch surgery threshold"
    )
    curvature_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Geometric scalar curvature pinning gain"
    )


@router.get("/manifolds")
async def list_ricci_manifolds():
    """List registered 3-manifolds."""
    svc = get_perelman_ricci_flow_shield_service()
    return {"manifolds": svc.get_manifolds()}


@router.post("/execute-surgery")
async def execute_ricci_flow_surgery(request: ExecuteSurgeryRequest):
    """Execute Ricci flow with surgery and evaluate W-entropy."""
    svc = get_perelman_ricci_flow_shield_service()
    try:
        return svc.execute_surgery(
            manifold_id=request.manifold_id,
            flow_time_tau=request.flow_time_tau,
            surgery_cutoff=request.surgery_cutoff,
            curvature_gain=request.curvature_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_ricci_metrics():
    """Return operational metrics for Perelman Ricci flow shield."""
    svc = get_perelman_ricci_flow_shield_service()
    return svc.get_metrics()
