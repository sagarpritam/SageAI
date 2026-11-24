"""
FastAPI Router for Capability 164: G_2 Holonomy Octonionic Instanton Shield & Associative 3-Cycle Calibrations.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.g2_octonionic_shield.g2_octonionic_shield import (
    get_g2_octonionic_shield_service,
)

router = APIRouter(
    prefix="/api/g2-octonionic-shield",
    tags=["Capability 164: G_2 Octonionic Shield"],
)


class CalibrateAssociativeRequest(BaseModel):
    manifold_id: str = Field(..., description="ID of the G_2 holonomy manifold")
    instanton_charge: int = Field(
        default=3, ge=1, le=32, description="Octonionic instanton topological charge"
    )
    torsion_free_precision: float = Field(
        default=1e-6,
        ge=1e-12,
        le=1e-2,
        description="Torsion-free G_2 3-form precision tolerance",
    )
    associative_refinement_depth: int = Field(
        default=8,
        ge=1,
        le=32,
        description="Associative 3-cycle volume calibration mesh depth",
    )
    calibration_gain: float = Field(
        default=1.2, ge=0.5, le=3.0, description="Coassociative instanton pinning gain"
    )


@router.get("/manifolds")
async def list_g2_manifolds():
    """List registered G_2 holonomy manifolds."""
    svc = get_g2_octonionic_shield_service()
    return {"manifolds": svc.get_manifolds()}


@router.post("/calibrate-associative")
async def calibrate_g2_associative(request: CalibrateAssociativeRequest):
    """Calibrate associative 3-cycles and solve octonionic instanton equations."""
    svc = get_g2_octonionic_shield_service()
    try:
        return svc.calibrate_associative(
            manifold_id=request.manifold_id,
            instanton_charge=request.instanton_charge,
            torsion_free_precision=request.torsion_free_precision,
            associative_refinement_depth=request.associative_refinement_depth,
            calibration_gain=request.calibration_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_g2_octonionic_metrics():
    """Return aggregate telemetry metrics for G_2 octonionic shield."""
    svc = get_g2_octonionic_shield_service()
    return svc.get_metrics()
