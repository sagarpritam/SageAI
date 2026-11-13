"""
FastAPI Router for Option B Wave 44: Planetary Chiral Topological Semimetal & Weyl Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.weyl_chiral_supergrid.weyl_chiral_supergrid import (
    get_weyl_chiral_supergrid,
)

router = APIRouter(
    prefix="/api/weyl-chiral-supergrid",
    tags=["Option B Wave 44: Planetary Chiral Topological Weyl Supergrid"],
)


class HarvestWeylRequest(BaseModel):
    array_id: str = Field(..., description="ID of the Weyl Semimetal array")
    fermi_arc_angstrom: float = Field(
        default=0.42,
        ge=0.1,
        le=2.5,
        description="Fermi-arc momentum separation in Angstrom^-1",
    )
    chiral_anomaly_gain: float = Field(
        default=1.6,
        ge=0.8,
        le=2.5,
        description="Chiral anomaly axial current multiplier",
    )


@router.get("/arrays")
async def list_weyl_arrays():
    """List registered Weyl Semimetal supergrid arrays."""
    grid = get_weyl_chiral_supergrid()
    return {"arrays": grid.get_arrays()}


@router.post("/harvest-weyl")
async def harvest_weyl_route(request: HarvestWeylRequest):
    """Harvest baseload power from Weyl semimetal chiral anomaly modes."""
    grid = get_weyl_chiral_supergrid()
    try:
        return grid.harvest_weyl_baseload(
            array_id=request.array_id,
            fermi_arc_angstrom=request.fermi_arc_angstrom,
            chiral_anomaly_gain=request.chiral_anomaly_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_weyl_metrics_route():
    """Return aggregate Planetary Chiral Weyl Supergrid metrics."""
    grid = get_weyl_chiral_supergrid()
    return grid.get_weyl_metrics()
