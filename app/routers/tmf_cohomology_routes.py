"""
FastAPI Router for Capability 121: Topological Modular Forms (TMF) & Elliptic Cohomology Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.tmf_cohomology.tmf_cohomology import get_tmf_cohomology_shield

router = APIRouter(
    prefix="/api/tmf-cohomology",
    tags=["Capability 121: Topological Modular Forms & Elliptic Cohomology Shield"],
)


class SealTorsionRequest(BaseModel):
    stratum_id: str = Field(
        ..., description="ID of the TMF elliptic cohomology stratum"
    )
    modular_weight: int = Field(
        default=12,
        ge=4,
        le=48,
        description="Modular form weight k for Witten genus invariant",
    )
    torsion_order: int = Field(
        default=24,
        ge=2,
        le=24,
        description="TMF homotopy torsion group order (e.g. Z/24)",
    )
    adams_page: int = Field(
        default=3,
        ge=2,
        le=9,
        description="Adams-Novikov spectral sequence differential convergence page",
    )
    elliptic_damping_gain: float = Field(
        default=1.45,
        ge=0.85,
        le=2.5,
        description="Elliptic cohomology torsion cancellation gain",
    )


@router.get("/strata")
async def list_strata():
    """List all registered TMF elliptic cohomology strata."""
    shield = get_tmf_cohomology_shield()
    return {"strata": shield.get_strata()}


@router.post("/seal-torsion")
async def seal_torsion_route(request: SealTorsionRequest):
    """Seal Z/24 torsion anomalies and evaluate Witten genus cohomology integrity."""
    shield = get_tmf_cohomology_shield()
    try:
        return shield.seal_tmf_torsion(
            stratum_id=request.stratum_id,
            modular_weight=request.modular_weight,
            torsion_order=request.torsion_order,
            adams_page=request.adams_page,
            elliptic_damping_gain=request.elliptic_damping_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_tmf_metrics():
    """Retrieve aggregate TMF Elliptic Cohomology Shield metrics."""
    shield = get_tmf_cohomology_shield()
    return shield.get_tmf_metrics()
