"""
FastAPI Router for Capability 145: HoTT Voevodsky Univalence & Infinity-Groupoid Cubical Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.homotopy_type_univalence.homotopy_type_univalence import (
    get_homotopy_univalence_firewall,
)

router = APIRouter(
    prefix="/api/homotopy-type-univalence",
    tags=["Capability 145: HoTT Voevodsky Univalence & Infinity-Groupoid Firewall"],
)


class SealUnivalenceRequest(BaseModel):
    universe_id: str = Field(..., description="ID of the HoTT univalent type universe")
    h_truncation_level: int = Field(
        default=2, ge=0, le=12, description="Homotopy n-truncation level"
    )
    cubical_dimension: int = Field(
        default=8, ge=2, le=64, description="Cubical Kan-fibration path dimension"
    )
    hit_constructors: int = Field(
        default=10, ge=2, le=64, description="Higher inductive type constructor rank"
    )
    univalence_gain: float = Field(
        default=1.6, ge=0.85, le=2.5, description="Univalent transport gain"
    )


@router.get("/universes")
async def list_univalent_universes():
    """List registered HoTT univalent type universes."""
    fw = get_homotopy_univalence_firewall()
    return {"universes": fw.get_universes()}


@router.post("/seal-univalence")
async def seal_univalence_route(request: SealUnivalenceRequest):
    """Enforce Voevodsky univalence equivalence and Kan-cubical path transport."""
    fw = get_homotopy_univalence_firewall()
    try:
        return fw.seal_univalent_path(
            universe_id=request.universe_id,
            h_truncation_level=request.h_truncation_level,
            cubical_dimension=request.cubical_dimension,
            hit_constructors=request.hit_constructors,
            univalence_gain=request.univalence_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_univalence_metrics():
    """Retrieve aggregate HoTT Univalence Firewall metrics."""
    fw = get_homotopy_univalence_firewall()
    return fw.get_univalence_metrics()
