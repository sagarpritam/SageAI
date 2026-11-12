"""
FastAPI Router for Capability 147: Fukaya A_infinity-Category & Floer Homology Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.symplectic_fukaya_floer.symplectic_fukaya_floer import (
    get_fukaya_floer_shield,
)

router = APIRouter(
    prefix="/api/symplectic-fukaya-floer",
    tags=["Capability 147: Fukaya A_infinity & Floer Homology Shield"],
)


class SealFloerRequest(BaseModel):
    brane_id: str = Field(..., description="ID of the Fukaya Lagrangian brane")
    ainf_order: int = Field(
        default=5, ge=2, le=24, description="Highest A_infinity composition order m_k"
    )
    holomorphic_disks: int = Field(
        default=14,
        ge=4,
        le=128,
        description="Pseudoholomorphic Gromov-Witten disk channels",
    )
    novikov_valuation_depth: int = Field(
        default=12, ge=4, le=64, description="Novikov valuation filtration depth"
    )
    symplectic_gain: float = Field(
        default=1.6, ge=0.85, le=2.5, description="Symplectic Floer stabilization gain"
    )


@router.get("/branes")
async def list_fukaya_branes():
    """List registered Fukaya Lagrangian branes."""
    sh = get_fukaya_floer_shield()
    return {"branes": sh.get_branes()}


@router.post("/seal-floer")
async def seal_floer_brane_route(request: SealFloerRequest):
    """Verify Maurer-Cartan flatness and lock Novikov Floer homology phases."""
    sh = get_fukaya_floer_shield()
    try:
        return sh.seal_floer_brane(
            brane_id=request.brane_id,
            ainf_order=request.ainf_order,
            holomorphic_disks=request.holomorphic_disks,
            novikov_valuation_depth=request.novikov_valuation_depth,
            symplectic_gain=request.symplectic_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_floer_metrics():
    """Retrieve aggregate Fukaya A_infinity & Floer Homology Shield metrics."""
    sh = get_fukaya_floer_shield()
    return sh.get_floer_metrics()
