"""
FastAPI Router for Option B Wave 45: Planetary Non-Abelian Majorana Zero-Mode Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.majorana_zero_supergrid.majorana_zero_supergrid import (
    get_majorana_zero_supergrid,
)

router = APIRouter(
    prefix="/api/majorana-zero-supergrid",
    tags=["Option B Wave 45: Planetary Majorana Zero-Mode Supergrid"],
)


class HarvestMajoranaRequest(BaseModel):
    array_id: str = Field(..., description="ID of the Majorana zero-mode array")
    topological_gap_muev: float = Field(
        default=640.0,
        ge=100.0,
        le=2500.0,
        description="Topological superconducting gap in micro-eV",
    )
    braid_coherence_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Non-abelian braid coherence multiplier",
    )


@router.get("/arrays")
async def list_majorana_arrays():
    """List registered Majorana zero-mode supergrid arrays."""
    sg = get_majorana_zero_supergrid()
    return {"arrays": sg.get_arrays()}


@router.post("/harvest-majorana")
async def harvest_majorana_route(request: HarvestMajoranaRequest):
    """Harvest baseload electrical power from topological Majorana zero-mode chains."""
    sg = get_majorana_zero_supergrid()
    try:
        return sg.harvest_majorana_baseload(
            array_id=request.array_id,
            topological_gap_muev=request.topological_gap_muev,
            braid_coherence_gain=request.braid_coherence_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_majorana_metrics_route():
    """Return aggregate Majorana Zero-Mode Supergrid metrics."""
    sg = get_majorana_zero_supergrid()
    return sg.get_grid_metrics()
