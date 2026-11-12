"""
FastAPI Router for Option B Wave 42: Planetary Kagome Chern & Polariton Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.kagome_chern_supergrid.kagome_chern_supergrid import (
    get_kagome_chern_supergrid,
)

router = APIRouter(
    prefix="/api/kagome-chern-supergrid",
    tags=["Option B Wave 42: Planetary Kagome Chern & Polariton Supergrid"],
)


class HarvestKagomeRequest(BaseModel):
    array_id: str = Field(..., description="ID of the Kagome Chern supergrid array")
    chern_gap_mev: float = Field(
        default=420.0,
        ge=120.0,
        le=1200.0,
        description="Chern topological bandgap (meV)",
    )
    polariton_coherence_gain: float = Field(
        default=1.6, ge=0.8, le=2.5, description="Exciton-polariton condensate gain"
    )


@router.get("/arrays")
async def list_kagome_arrays():
    """List registered Kagome Chern & polariton supergrid arrays."""
    grid = get_kagome_chern_supergrid()
    return {"arrays": grid.get_arrays()}


@router.post("/harvest-kagome")
async def harvest_kagome_baseload_route(request: HarvestKagomeRequest):
    """Synchronize Kagome van-Hove singularities and polariton condensates into clean baseload."""
    grid = get_kagome_chern_supergrid()
    try:
        return grid.harvest_kagome_baseload(
            array_id=request.array_id,
            chern_gap_mev=request.chern_gap_mev,
            polariton_coherence_gain=request.polariton_coherence_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_kagome_metrics():
    """Retrieve aggregate Planetary Kagome Chern & Polariton Supergrid metrics."""
    grid = get_kagome_chern_supergrid()
    return grid.get_kagome_metrics()
