"""
FastAPI Router for Option B Wave 43: Planetary Altermagnetic & Magnonic Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.altermagnetic_magnon_supergrid.altermagnetic_magnon_supergrid import (
    get_altermagnetic_magnon_supergrid,
)

router = APIRouter(
    prefix="/api/altermagnetic-magnon-supergrid",
    tags=["Option B Wave 43: Planetary Altermagnetic & Magnonic Supergrid"],
)


class HarvestAltermagneticRequest(BaseModel):
    array_id: str = Field(..., description="ID of the Altermagnetic supergrid array")
    spin_splitting_mev: float = Field(
        default=480.0,
        ge=140.0,
        le=1400.0,
        description="d-wave altermagnetic spin splitting (meV)",
    )
    magnon_coherence_gain: float = Field(
        default=1.6, ge=0.8, le=2.5, description="Chiral magnonic coherence gain"
    )


@router.get("/arrays")
async def list_altermagnetic_arrays():
    """List registered Altermagnetic & Magnonic supergrid arrays."""
    grid = get_altermagnetic_magnon_supergrid()
    return {"arrays": grid.get_arrays()}


@router.post("/harvest-altermagnet")
async def harvest_altermagnetic_baseload_route(request: HarvestAltermagneticRequest):
    """Synchronize altermagnetic spin-split bands and chiral magnons into clean baseload."""
    grid = get_altermagnetic_magnon_supergrid()
    try:
        return grid.harvest_altermagnetic_baseload(
            array_id=request.array_id,
            spin_splitting_mev=request.spin_splitting_mev,
            magnon_coherence_gain=request.magnon_coherence_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_altermagnetic_metrics():
    """Retrieve aggregate Planetary Altermagnetic & Magnonic Supergrid metrics."""
    grid = get_altermagnetic_magnon_supergrid()
    return grid.get_altermagnetic_metrics()
