"""
FastAPI Router for Capability 167: Spin(7) Holonomy Cayley 4-Cycle Calibration Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.spin7_cayley_shield.spin7_cayley_shield import (
    get_spin7_cayley_shield_service,
)

router = APIRouter(
    prefix="/api/spin7-cayley-shield",
    tags=["Capability 167: Spin(7) Cayley Shield"],
)


class CalibrateCayleyRequest(BaseModel):
    manifold_id: str = Field(..., description="ID of the Spin(7) holonomy manifold")
    cayley_order: int = Field(
        default=4, ge=1, le=32, description="Cayley 4-form instanton topological charge"
    )
    self_dual_precision: float = Field(
        default=1e-6,
        ge=1e-12,
        le=1e-2,
        description="Self-dual Spin(7) curvature precision tolerance",
    )
    octonionic_slice_depth: int = Field(
        default=8,
        ge=1,
        le=32,
        description="Cayley 4-cycle volume calibration mesh depth",
    )
    calibration_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Cayley instanton pinning gain"
    )


@router.get("/manifolds")
async def list_spin7_manifolds():
    """List registered Spin(7) holonomy manifolds."""
    svc = get_spin7_cayley_shield_service()
    return {"manifolds": svc.get_manifolds()}


@router.post("/calibrate-cayley")
async def calibrate_spin7_cayley(request: CalibrateCayleyRequest):
    """Calibrate Cayley 4-cycles and solve Spin(7) instanton calibration."""
    svc = get_spin7_cayley_shield_service()
    try:
        return svc.calibrate_cayley(
            manifold_id=request.manifold_id,
            cayley_order=request.cayley_order,
            self_dual_precision=request.self_dual_precision,
            octonionic_slice_depth=request.octonionic_slice_depth,
            calibration_gain=request.calibration_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_spin7_cayley_metrics():
    """Return aggregate telemetry metrics for Spin(7) Cayley shield."""
    svc = get_spin7_cayley_shield_service()
    return svc.get_metrics()
