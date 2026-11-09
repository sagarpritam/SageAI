"""
FastAPI Router for Option B Wave 28: Sovereign Planetary Magnetic Monopole Proton Decay Battery.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.services.monopole_catalysis_battery.monopole_catalysis_battery import (
    get_magnetic_monopole_catalyzed_battery,
)

router = APIRouter(prefix="/api/monopole-battery", tags=["Option B Wave 28: Magnetic Monopole Battery"])


class CatalyzeProtonDecayRequest(BaseModel):
    trap_id: str = Field(..., description="ID of the magnetic monopole battery trap")
    proton_feed_ug_s: float = Field(default=1.2, ge=0.1, le=5.0, description="Proton fuel injection rate in micrograms/sec")
    confinement_boost: float = Field(default=1.05, ge=0.8, le=2.0, description="Superconducting confinement field boost")
    load_demand_gw: float = Field(default=100.0, ge=10.0, le=300.0, description="Electrical baseload demand in Gigawatts")


@router.get("/traps")
async def list_traps():
    """List all registered magnetic monopole battery traps."""
    battery = get_magnetic_monopole_catalyzed_battery()
    return {"traps": battery.get_traps()}


@router.post("/catalyze-decay")
async def catalyze_decay_route(request: CatalyzeProtonDecayRequest):
    """Catalyze nucleon decay p + M -> e+ + pi0 + M via Callan-Rubakov effect."""
    battery = get_magnetic_monopole_catalyzed_battery()
    try:
        telemetry = battery.catalyze_proton_decay(
            trap_id=request.trap_id,
            proton_feed_ug_s=request.proton_feed_ug_s,
            confinement_boost=request.confinement_boost,
            load_demand_gw=request.load_demand_gw,
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_monopole_metrics():
    """Retrieve aggregate magnetic monopole battery metrics."""
    battery = get_magnetic_monopole_catalyzed_battery()
    return battery.get_monopole_metrics()
