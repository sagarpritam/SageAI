"""
FastAPI Router for Capability 139: Ecalle Alien-Calculus Resurgence & Borel-Pade Transseries Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.resurgence_transseries_shield.resurgence_transseries_shield import (
    get_resurgence_transseries_shield,
)

router = APIRouter(
    prefix="/api/resurgence-transseries-shield",
    tags=["Capability 139: Resurgence & Borel-Pade Transseries Shield"],
)


class ResumBorelTransseriesRequest(BaseModel):
    transseries_id: str = Field(
        ..., description="ID of the Borel-Pade transseries manifold"
    )
    borel_pade_degree: int = Field(
        default=24, ge=8, le=128, description="Borel-Pade approximant degree [N/M]"
    )
    stokes_ray_sectors: int = Field(
        default=8, ge=2, le=32, description="Stokes phenomenon ray sector count"
    )
    alien_instanton_order: int = Field(
        default=4, ge=1, le=16, description="Ecalle alien derivative instanton order"
    )
    resurgence_gain: float = Field(
        default=1.5, ge=0.85, le=2.5, description="Lefschetz thimble median gain"
    )


@router.get("/transseries")
async def list_transseries():
    """List registered Borel-Pade transseries manifolds."""
    shield = get_resurgence_transseries_shield()
    return {"transseries": shield.get_transseries_list()}


@router.post("/resum-borel")
async def resum_borel_route(request: ResumBorelTransseriesRequest):
    """Execute median Borel-Pade resummation and cancel Stokes ambiguities."""
    shield = get_resurgence_transseries_shield()
    try:
        return shield.resum_borel_transseries(
            transseries_id=request.transseries_id,
            borel_pade_degree=request.borel_pade_degree,
            stokes_ray_sectors=request.stokes_ray_sectors,
            alien_instanton_order=request.alien_instanton_order,
            resurgence_gain=request.resurgence_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_resurgence_metrics():
    """Retrieve aggregate Resurgence Transseries Shield metrics."""
    shield = get_resurgence_transseries_shield()
    return shield.get_resurgence_metrics()
