"""
FastAPI Router for Option B Wave 30: Sovereign Zero-Point Schwinger-Vacua Harvester.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.schwinger_vacuum_harvester.schwinger_vacuum_harvester import (
    get_schwinger_vacuum_harvester,
)

router = APIRouter(
    prefix="/api/schwinger-vacuum",
    tags=["Option B Wave 30: Schwinger-Vacua Pair-Production Harvester"],
)


class HarvestCascadeRequest(BaseModel):
    cavity_id: str = Field(
        ..., description="ID of the Schwinger vacuum pair-production cavity"
    )
    field_ratio_e_ec: float = Field(
        default=0.86,
        ge=0.55,
        le=0.96,
        description="Normalized electric field ratio E / E_c near Schwinger limit",
    )
    beam_pulse_hz: float = Field(
        default=120.0,
        ge=40.0,
        le=300.0,
        description="Breit-Wheeler seed laser repetition rate in Hz",
    )
    recovery_coupling_gain: float = Field(
        default=1.12,
        ge=0.8,
        le=1.5,
        description="Cyclotron-Bragg direct beam recovery gain",
    )


@router.get("/cavities")
async def list_cavities():
    """List all registered Schwinger vacuum pair-production cavities."""
    harvester = get_schwinger_vacuum_harvester()
    return {"cavities": harvester.get_cavities()}


@router.post("/harvest-cascade")
async def harvest_cascade_route(request: HarvestCascadeRequest):
    """Harvest Schwinger QED e+e- pair-production cascade power with zero waste."""
    harvester = get_schwinger_vacuum_harvester()
    try:
        return harvester.harvest_pair_cascade(
            cavity_id=request.cavity_id,
            field_ratio_e_ec=request.field_ratio_e_ec,
            beam_pulse_hz=request.beam_pulse_hz,
            recovery_coupling_gain=request.recovery_coupling_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_schwinger_metrics():
    """Retrieve aggregate Schwinger vacuum harvester metrics."""
    harvester = get_schwinger_vacuum_harvester()
    return harvester.get_schwinger_metrics()
