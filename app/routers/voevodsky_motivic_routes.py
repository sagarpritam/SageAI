"""
FastAPI Router for Capability 168: Voevodsky Motivic Homotopy Shield & Algebraic Cobordism MGL.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.voevodsky_motivic_shield.voevodsky_motivic_shield import (
    get_voevodsky_motivic_shield_service,
)

router = APIRouter(
    prefix="/api/voevodsky-motivic-shield",
    tags=["Capability 168: Voevodsky Motivic Shield"],
)


class EvaluateHomotopyRequest(BaseModel):
    motive_id: str = Field(..., description="ID of the motivic homotopy scheme")
    slice_filtration_level: int = Field(
        default=3, ge=1, le=16, description="Voevodsky slice filtration spectral level"
    )
    nisnevich_cohomology_degree: int = Field(
        default=2, ge=0, le=12, description="Nisnevich sheaf cohomology degree"
    )
    weight_p: int = Field(
        default=4, ge=1, le=16, description="Motivic Adams-Novikov weight parameter"
    )
    homotopy_gain: float = Field(
        default=1.2, ge=0.5, le=3.0, description="Cobordism MGL barrier amplification gain"
    )


@router.get("/motives")
async def list_motivic_schemes():
    """List registered motivic homotopy schemes."""
    svc = get_voevodsky_motivic_shield_service()
    return {"motives": svc.get_motives()}


@router.post("/evaluate-homotopy")
async def evaluate_motivic_homotopy(request: EvaluateHomotopyRequest):
    """Evaluate A^1-homotopy localization and synthesize motivic cobordism barrier."""
    svc = get_voevodsky_motivic_shield_service()
    try:
        return svc.evaluate_homotopy(
            motive_id=request.motive_id,
            slice_filtration_level=request.slice_filtration_level,
            nisnevich_cohomology_degree=request.nisnevich_cohomology_degree,
            weight_p=request.weight_p,
            homotopy_gain=request.homotopy_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_voevodsky_motivic_metrics():
    """Return aggregate telemetry metrics for Voevodsky motivic shield."""
    svc = get_voevodsky_motivic_shield_service()
    return svc.get_metrics()
