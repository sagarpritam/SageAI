"""
FastAPI Router for Option B Wave 27: Sovereign Planetary Antimatter-Catalyzed Fusion Rocket.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.services.antimatter_catalyzed_fusion.antimatter_catalyzed_fusion import (
    get_antimatter_catalyzed_fusion_rocket,
)

router = APIRouter(prefix="/api/antimatter-fusion", tags=["Option B Wave 27: Antimatter-Catalyzed Fusion"])


class IgnitePulseRequest(BaseModel):
    thruster_id: str = Field(..., description="ID of the ACF rocket thruster")
    antiprotons_pg: float = Field(default=0.5, ge=0.05, le=5.0, description="Antiproton injection dose in picograms")
    pellet_compression_gain: float = Field(default=1.1, ge=0.8, le=2.5, description="Thermonuclear pellet compression factor")
    rep_rate_hz: float = Field(default=30.0, ge=5.0, le=60.0, description="Pulse repetition frequency in Hz")


@router.get("/thrusters")
async def list_thrusters():
    """List all registered antimatter-catalyzed fusion thrusters."""
    rocket = get_antimatter_catalyzed_fusion_rocket()
    return {"thrusters": rocket.get_thrusters()}


@router.post("/ignite-pulse")
async def ignite_pulse_route(request: IgnitePulseRequest):
    """Ignite an antiproton-catalyzed micro-fission/fusion pulse cycle."""
    rocket = get_antimatter_catalyzed_fusion_rocket()
    try:
        telemetry = rocket.ignite_pulse(
            thruster_id=request.thruster_id,
            antiprotons_pg=request.antiprotons_pg,
            pellet_compression_gain=request.pellet_compression_gain,
            rep_rate_hz=request.rep_rate_hz,
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_antimatter_fusion_metrics():
    """Retrieve aggregate ACF rocket propulsion metrics."""
    rocket = get_antimatter_catalyzed_fusion_rocket()
    return rocket.get_antimatter_fusion_metrics()

