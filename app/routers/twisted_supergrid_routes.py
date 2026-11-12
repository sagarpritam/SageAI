"""
FastAPI Router for Option B Wave 41: Planetary Magic-Angle Twisted-Trilayer Andreev Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.twisted_bilayer_supergrid.twisted_bilayer_supergrid import (
    get_twisted_trilayer_supergrid,
)

router = APIRouter(
    prefix="/api/twisted-bilayer-supergrid",
    tags=["Option B Wave 41: Magic-Angle Twisted-Trilayer Andreev Supergrid"],
)


class HarvestAndreevRequest(BaseModel):
    array_id: str = Field(..., description="ID of the Andreev supergrid array")
    twist_angle_millideg: float = Field(
        default=1560.0,
        ge=900.0,
        le=2400.0,
        description="Magic-angle trilayer twist in millidegrees",
    )
    quantum_metric_gain: float = Field(
        default=1.6,
        ge=0.8,
        le=2.5,
        description="Flat-band quantum-metric pairing gain",
    )


@router.get("/arrays")
async def list_andreev_arrays():
    """List registered magic-angle twisted-trilayer Andreev arrays."""
    grid = get_twisted_trilayer_supergrid()
    return {"arrays": grid.get_arrays()}


@router.post("/harvest-andreev")
async def harvest_andreev_route(request: HarvestAndreevRequest):
    """Synchronize twisted-trilayer Andreev junctions to harvest clean baseload."""
    grid = get_twisted_trilayer_supergrid()
    try:
        return grid.harvest_andreev_baseload(
            array_id=request.array_id,
            twist_angle_millideg=request.twist_angle_millideg,
            quantum_metric_gain=request.quantum_metric_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_supergrid_metrics():
    """Retrieve aggregate Planetary Andreev Supergrid metrics."""
    grid = get_twisted_trilayer_supergrid()
    return grid.get_supergrid_metrics()
