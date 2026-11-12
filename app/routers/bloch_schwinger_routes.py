"""
FastAPI Router for Option B (Wave 36): Planetary Topological Floquet-Bloch Photonic Cavity Power Grid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.bloch_schwinger_power.bloch_schwinger_power import (
    get_bloch_schwinger_power_grid,
)

router = APIRouter(
    prefix="/api/bloch-schwinger-power",
    tags=["Option B Wave 36: Planetary Floquet-Bloch Photonic Power Grid"],
)


class HarvestFloquetRequest(BaseModel):
    cavity_id: str = Field(
        ..., description="ID of the Floquet-Bloch photonic power cavity"
    )
    floquet_drive_thz: float = Field(
        default=18.5,
        ge=8.0,
        le=90.0,
        description="Floquet periodic optical modulation frequency in THz",
    )
    edge_rectifier_gain: float = Field(
        default=1.5,
        ge=0.85,
        le=2.5,
        description="Topological Haldane-edge Kerr soliton rectification gain",
    )


@router.get("/cavities")
async def list_cavities():
    """List all registered Floquet-Bloch photonic power cavities."""
    grid = get_bloch_schwinger_power_grid()
    return {"cavities": grid.get_cavities()}


@router.post("/harvest-floquet")
async def harvest_floquet_route(request: HarvestFloquetRequest):
    """Harvest clean electrical baseload from Floquet-Bloch topological photonic modes."""
    grid = get_bloch_schwinger_power_grid()
    try:
        return grid.harvest_floquet_baseload(
            cavity_id=request.cavity_id,
            floquet_drive_thz=request.floquet_drive_thz,
            edge_rectifier_gain=request.edge_rectifier_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_bloch_schwinger_metrics():
    """Retrieve aggregate Floquet-Bloch photonic power grid metrics."""
    grid = get_bloch_schwinger_power_grid()
    return grid.get_bloch_schwinger_metrics()
