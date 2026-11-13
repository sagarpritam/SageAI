"""
FastAPI Router for Capability 154: Quantum Cohomology & Gromov-Witten Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.quantum_gromov_witten.quantum_gromov_witten import (
    get_quantum_gromov_witten_shield,
)

router = APIRouter(
    prefix="/api/quantum-gromov-witten",
    tags=["Capability 154: Quantum Cohomology & Gromov-Witten Invariant"],
)


class SealGromovWittenRequest(BaseModel):
    invariant_id: str = Field(..., description="ID of the Gromov-Witten invariant")
    curve_genus: int = Field(
        default=0, ge=0, le=8, description="Stable curve genus g"
    )
    marked_points: int = Field(
        default=14, ge=3, le=64, description="Marked evaluation points n"
    )
    novikov_degree: int = Field(
        default=12, ge=1, le=64, description="Novikov ring degree d"
    )
    quantum_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Virtual cycle intersection gain",
    )


@router.get("/invariants")
async def list_gromov_witten_invariants():
    """List registered Gromov-Witten invariants & quantum cohomology rings."""
    sh = get_quantum_gromov_witten_shield()
    return {"invariants": sh.get_invariants()}


@router.post("/seal-gromov")
async def seal_gromov_witten_route(request: SealGromovWittenRequest):
    """Seal WDVV associativity equations and lock virtual cycle intersections."""
    sh = get_quantum_gromov_witten_shield()
    try:
        return sh.seal_gromov_witten(
            invariant_id=request.invariant_id,
            curve_genus=request.curve_genus,
            marked_points=request.marked_points,
            novikov_degree=request.novikov_degree,
            quantum_gain=request.quantum_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_gromov_witten_metrics_route():
    """Return aggregate Quantum Cohomology & Gromov-Witten Shield telemetry."""
    sh = get_quantum_gromov_witten_shield()
    return sh.get_gromov_metrics()
