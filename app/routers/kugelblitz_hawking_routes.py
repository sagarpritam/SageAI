"""
FastAPI Router for Option B Wave 29: Sovereign Planetary Kugelblitz Hawking Generator.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.kugelblitz_hawking_generator.kugelblitz_hawking_generator import (
    get_kugelblitz_hawking_generator,
)

router = APIRouter(
    prefix="/api/kugelblitz-hawking",
    tags=["Option B Wave 29: Kugelblitz Hawking Generator"],
)


class HarvestPowerRequest(BaseModel):
    core_id: str = Field(..., description="ID of the Kugelblitz micro-black-hole core")
    singularity_mass_1e10_kg: float = Field(
        default=5.0,
        ge=2.0,
        le=12.0,
        description="Micro-black-hole mass in units of 10^10 kg",
    )
    accretion_feed_mg_s: float = Field(
        default=1.58,
        ge=0.2,
        le=10.0,
        description="Steady-state baryonic accretion mass feed rate (mg/s)",
    )
    penrose_coupling_gain: float = Field(
        default=1.1,
        ge=0.8,
        le=2.0,
        description="Penrose magnetospheric direct conversion gain",
    )


@router.get("/cores")
async def list_cores():
    """List all registered Kugelblitz micro-black-hole generator cores."""
    generator = get_kugelblitz_hawking_generator()
    return {"cores": generator.get_cores()}


@router.post("/harvest-power")
async def harvest_power_route(request: HarvestPowerRequest):
    """Harvest continuous clean electrical baseload via Hawking blackbody radiance."""
    generator = get_kugelblitz_hawking_generator()
    try:
        return generator.harvest_hawking_power(
            core_id=request.core_id,
            singularity_mass_1e10_kg=request.singularity_mass_1e10_kg,
            accretion_feed_mg_s=request.accretion_feed_mg_s,
            penrose_coupling_gain=request.penrose_coupling_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_kugelblitz_metrics():
    """Retrieve aggregate Kugelblitz Hawking generator metrics."""
    generator = get_kugelblitz_hawking_generator()
    return generator.get_kugelblitz_metrics()
