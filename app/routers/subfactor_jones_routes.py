"""
FastAPI Router for Capability 134: Vaughan-Jones Subfactor Planar Algebra & Temperley-Lieb Braid Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.subfactor_jones_planars.subfactor_jones_planars import (
    get_subfactor_jones_planar_firewall,
)

router = APIRouter(
    prefix="/api/subfactor-jones-planars",
    tags=["Capability 134: Vaughan-Jones Subfactor Planar Algebra Firewall"],
)


class CompressPlanarTangleRequest(BaseModel):
    algebra_id: str = Field(
        ..., description="ID of the Vaughan-Jones subfactor planar algebra"
    )
    jones_level_k: int = Field(
        default=28,
        ge=3,
        le=128,
        description="Jones index quantum level k",
    )
    tangle_boxes: int = Field(
        default=16,
        ge=4,
        le=128,
        description="Number of planar tangle input boxes",
    )
    tl_strand_count: int = Field(
        default=12,
        ge=4,
        le=64,
        description="Temperley-Lieb strand count n",
    )
    planar_gain: float = Field(
        default=1.5,
        ge=0.85,
        le=2.5,
        description="Biunitary Jones-Wenzl projector gain",
    )


@router.get("/algebras")
async def list_algebras():
    """List registered Vaughan-Jones subfactor planar algebras."""
    fw = get_subfactor_jones_planar_firewall()
    return {"algebras": fw.get_algebras()}


@router.post("/compress-tangle")
async def compress_tangle_route(request: CompressPlanarTangleRequest):
    """Contract Temperley-Lieb planar tangles and enforce biunitary Jones-Wenzl projectors."""
    fw = get_subfactor_jones_planar_firewall()
    try:
        return fw.compress_planar_tangle(
            algebra_id=request.algebra_id,
            jones_level_k=request.jones_level_k,
            tangle_boxes=request.tangle_boxes,
            tl_strand_count=request.tl_strand_count,
            planar_gain=request.planar_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_subfactor_metrics():
    """Retrieve aggregate Vaughan-Jones Subfactor Planar Algebra telemetry."""
    fw = get_subfactor_jones_planar_firewall()
    return fw.get_subfactor_metrics()
