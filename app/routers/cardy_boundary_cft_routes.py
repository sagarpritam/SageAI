"""
FastAPI Router for Capability 166: Conformal Boundary CFT Cardy State Shield & Verlinde Fusion Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.cardy_boundary_cft.cardy_boundary_cft import (
    get_cardy_boundary_cft_service,
)

router = APIRouter(
    prefix="/api/cardy-boundary-cft",
    tags=["Capability 166: Cardy Boundary CFT Shield"],
)


class SealBoundaryRequest(BaseModel):
    state_id: str = Field(..., description="ID of the Cardy boundary state")
    modular_s_parameter: float = Field(
        default=0.7071, ge=0.01, le=5.0, description="Modular S-matrix element S_{0j}"
    )
    verlinde_fusion_level_k: int = Field(
        default=4, ge=1, le=32, description="Verlinde algebra fusion level k"
    )
    boundary_defect_charge: float = Field(
        default=1.0,
        ge=0.1,
        le=10.0,
        description="Affleck-Ludwig boundary defect entropy parameter",
    )
    conformal_gain: float = Field(
        default=1.2,
        ge=0.5,
        le=3.0,
        description="Boundary conformal pinning gain multiplier",
    )


@router.get("/states")
async def list_cardy_states():
    """List registered Cardy boundary CFT states."""
    svc = get_cardy_boundary_cft_service()
    return {"states": svc.get_states()}


@router.post("/seal-boundary")
async def seal_cardy_boundary(request: SealBoundaryRequest):
    """Seal conformal boundary state and evaluate cross-channel modular invariance."""
    svc = get_cardy_boundary_cft_service()
    try:
        return svc.seal_boundary(
            state_id=request.state_id,
            modular_s_parameter=request.modular_s_parameter,
            verlinde_fusion_level_k=request.verlinde_fusion_level_k,
            boundary_defect_charge=request.boundary_defect_charge,
            conformal_gain=request.conformal_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_cardy_boundary_metrics():
    """Return aggregate telemetry metrics for Cardy boundary CFT shield."""
    svc = get_cardy_boundary_cft_service()
    return svc.get_metrics()
