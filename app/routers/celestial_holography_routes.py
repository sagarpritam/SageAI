"""
FastAPI Router for Capability 116: Celestial Holography w_{1+infinity} & BMS4 Memory Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.celestial_holography.celestial_holography import (
    get_celestial_holography_shield,
)

router = APIRouter(
    prefix="/api/celestial-holography",
    tags=["Capability 116: Celestial Holography w_{1+infinity} & BMS4 Shield"],
)


class SealWardRequest(BaseModel):
    boundary_id: str = Field(
        ..., description="ID of the null-infinity celestial sphere boundary"
    )
    mellin_boost_delta: float = Field(
        default=1.5,
        ge=0.5,
        le=4.0,
        description="Conformal boost weight Delta in Mellin-transformed CCFT",
    )
    soft_theorem_order: int = Field(
        default=2,
        ge=0,
        le=6,
        description="Soft graviton / gluon expansion order in Bondi memory theorem",
    )
    w_infinity_mode_cutoff: int = Field(
        default=20,
        ge=4,
        le=64,
        description="Truncated wedge generator cutoff for w_{1+infinity} algebra",
    )
    bms_damping_gain: float = Field(
        default=1.35,
        ge=0.85,
        le=2.5,
        description="BMS4 supertranslation shear damping gain",
    )


@router.get("/boundaries")
async def list_boundaries():
    """List all registered null-infinity celestial sphere boundaries."""
    shield = get_celestial_holography_shield()
    return {"boundaries": shield.get_boundaries()}


@router.post("/seal-ward")
async def seal_ward_route(request: SealWardRequest):
    """Seal BMS4 supertranslation Ward identity & w_{1+infinity} chiral algebra."""
    shield = get_celestial_holography_shield()
    try:
        return shield.seal_bms_ward_identity(
            boundary_id=request.boundary_id,
            mellin_boost_delta=request.mellin_boost_delta,
            soft_theorem_order=request.soft_theorem_order,
            w_infinity_mode_cutoff=request.w_infinity_mode_cutoff,
            bms_damping_gain=request.bms_damping_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_celestial_metrics():
    """Retrieve aggregate Celestial Holography shield metrics."""
    shield = get_celestial_holography_shield()
    return shield.get_celestial_metrics()
