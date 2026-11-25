"""
FastAPI router for Capability 189: Grothendieck-Riemann-Roch & Baum-Fulton-MacPherson Singular Intersection Barrier.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.grr_baum_fulton_macpherson_barrier import (
    get_grr_baum_fulton_macpherson_barrier_service,
)

router = APIRouter(
    prefix="/api/grr-baum-fulton-macpherson",
    tags=["GRR Baum-Fulton-MacPherson Barrier"],
)


class ComputeSingularChernCharacterRequest(BaseModel):
    variety_id: str = Field(..., description="ID of the singular variety configuration")
    stratification_depth: int = Field(
        default=3, ge=1, le=12, description="Whitney stratification filtration depth"
    )
    todd_degree: int = Field(
        default=4, ge=1, le=16, description="Singular Todd class polynomial degree"
    )
    barrier_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Intersection homology barrier gain"
    )


@router.get("/varieties")
async def list_singular_varieties():
    """List registered singular varieties and Chow homology configurations."""
    svc = get_grr_baum_fulton_macpherson_barrier_service()
    return {"varieties": svc.get_varieties()}


@router.post("/compute-singular-chern-character")
async def compute_singular_chern_character(request: ComputeSingularChernCharacterRequest):
    """Compute singular Chern character on Chow homology and enforce BFM commutativity."""
    svc = get_grr_baum_fulton_macpherson_barrier_service()
    try:
        return svc.compute_singular_chern_character(
            variety_id=request.variety_id,
            stratification_depth=request.stratification_depth,
            todd_degree=request.todd_degree,
            barrier_gain=request.barrier_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_grr_barrier_metrics():
    """Get operational telemetry metrics for GRR Baum-Fulton-MacPherson barrier."""
    svc = get_grr_baum_fulton_macpherson_barrier_service()
    return svc.get_metrics()
