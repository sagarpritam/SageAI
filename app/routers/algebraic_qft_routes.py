"""
FastAPI Router for Capability 132: Algebraic QFT (AQFT) Haag-Kastler Net & Tomita-Takesaki Modular Wedge Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.algebraic_qft_haag.algebraic_qft_haag import (
    get_algebraic_qft_haag_shield,
)

router = APIRouter(
    prefix="/api/algebraic-qft-haag",
    tags=["Capability 132: AQFT Haag-Kastler Net & Tomita-Takesaki Shield"],
)


class SealHaagNetRequest(BaseModel):
    algebra_id: str = Field(
        ..., description="ID of the AQFT Haag-Kastler algebra sector"
    )
    diamond_radius: float = Field(
        default=2.4, ge=0.5, le=20.0, description="Double-cone causal diamond radius R"
    )
    split_distance: float = Field(
        default=0.45, ge=0.1, le=5.0, description="Buchholz-Wichmann split corridor gap"
    )
    modular_temp: float = Field(
        default=1.0,
        ge=0.25,
        le=8.0,
        description="Bisognano-Wichmann modular inverse temperature",
    )
    nuclearity_gain: float = Field(
        default=1.5, ge=0.85, le=2.5, description="Split-property nuclearity clamp gain"
    )


@router.get("/algebras")
async def list_algebras():
    """List registered AQFT Haag-Kastler algebraic net sectors."""
    shield = get_algebraic_qft_haag_shield()
    return {"algebras": shield.get_algebras()}


@router.post("/seal-net")
async def seal_net_route(request: SealHaagNetRequest):
    """Audit Einstein microcausality and seal Tomita-Takesaki modular wedges."""
    shield = get_algebraic_qft_haag_shield()
    try:
        return shield.seal_haag_net(
            algebra_id=request.algebra_id,
            diamond_radius=request.diamond_radius,
            split_distance=request.split_distance,
            modular_temp=request.modular_temp,
            nuclearity_gain=request.nuclearity_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_aqft_metrics():
    """Retrieve aggregate AQFT Haag-Kastler shield telemetry."""
    shield = get_algebraic_qft_haag_shield()
    return shield.get_aqft_metrics()
