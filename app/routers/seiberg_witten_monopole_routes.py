"""
FastAPI Router for Capability 158: Seiberg-Witten Monopole Invariants & Spin^c 4-Manifold Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.seiberg_witten_monopole.seiberg_witten_monopole import (
    get_seiberg_witten_monopole_shield,
)

router = APIRouter(
    prefix="/api/seiberg-witten-monopole",
    tags=["Capability 158: Seiberg-Witten Monopole Shield"],
)


class SealSeibergWittenRequest(BaseModel):
    monopole_id: str = Field(
        ..., description="ID of the Seiberg-Witten monopole configuration"
    )
    spinor_rank: int = Field(
        default=4, ge=1, le=16, description="Positive spinor bundle rank"
    )
    dirac_degree: int = Field(
        default=6, ge=2, le=64, description="Dirac operator coupled harmonic degree"
    )
    moduli_chamber_depth: int = Field(
        default=8,
        ge=2,
        le=32,
        description="Seiberg-Witten moduli chamber wall-crossing depth",
    )
    sw_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Curvature monopole coherence gain multiplier",
    )


@router.get("/monopoles")
async def list_seiberg_witten_monopoles():
    """List registered Seiberg-Witten monopole configurations."""
    sw = get_seiberg_witten_monopole_shield()
    return {"monopoles": sw.get_monopoles()}


@router.post("/seal-sw")
async def seal_seiberg_witten_route(request: SealSeibergWittenRequest):
    """Verify Seiberg-Witten Dirac-monopole equations and lock Spin^c basic classes."""
    sw = get_seiberg_witten_monopole_shield()
    try:
        return sw.seal_seiberg_witten(
            monopole_id=request.monopole_id,
            spinor_rank=request.spinor_rank,
            dirac_degree=request.dirac_degree,
            moduli_chamber_depth=request.moduli_chamber_depth,
            sw_gain=request.sw_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_sw_metrics_route():
    """Return aggregate Seiberg-Witten Monopole Shield telemetry."""
    sw = get_seiberg_witten_monopole_shield()
    return sw.get_sw_metrics()
