"""
FastAPI Router for Capability 108: Holographic AdS/CFT HaPPY Tensor Network QEC.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.happy_holographic_qec.happy_holographic_qec import (
    get_happy_holographic_qec,
)

router = APIRouter(
    prefix="/api/happy-holographic-qec",
    tags=["Capability 108: HaPPY Holographic QEC"],
)


class CorrectErasureRequest(BaseModel):
    tessellation_id: str = Field(..., description="ID of the HaPPY hyperbolic lattice")
    boundary_erasure_pct: float = Field(
        default=28.0,
        ge=2.0,
        le=48.0,
        description="Percentage of CFT boundary qubits erased",
    )
    hyperbolic_layers: int = Field(
        default=5,
        ge=3,
        le=10,
        description="Number of hyperbolic {5,4} tensor layers",
    )
    recovery_gain: float = Field(
        default=1.15,
        ge=0.8,
        le=2.5,
        description="Greedy entanglement wedge reconstruction gain",
    )


@router.get("/tessellations")
async def list_tessellations():
    """List all registered HaPPY hyperbolic tensor tessellations."""
    qec = get_happy_holographic_qec()
    return {"tessellations": qec.get_tessellations()}


@router.post("/correct-erasure")
async def correct_erasure_route(request: CorrectErasureRequest):
    """Reconstruct bulk logical qubits from boundary CFT under erasure noise."""
    qec = get_happy_holographic_qec()
    try:
        return qec.correct_erasure(
            tessellation_id=request.tessellation_id,
            boundary_erasure_pct=request.boundary_erasure_pct,
            hyperbolic_layers=request.hyperbolic_layers,
            recovery_gain=request.recovery_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_happy_metrics():
    """Retrieve aggregate HaPPY holographic QEC metrics."""
    qec = get_happy_holographic_qec()
    return qec.get_happy_metrics()
