from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_van_allen_radiation_belt_betatron_supergrid import (
    get_planetary_van_allen_radiation_belt_betatron_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-van-allen-belt", tags=["Wave 70 Planetary Van Allen Belt"])


class VanAllenHarvestRequest(BaseModel):
    belt_id: str = "VAN-ALLEN-INNER-PROTON-01"
    cyclotron_multiplier: float = 1.05
    betatron_efficiency: float = 0.99
    dispatch_duration_s: float = 60.0


@router.get("/belts")
async def list_belts():
    return get_planetary_van_allen_radiation_belt_betatron_supergrid_service().list_belts()


@router.post("/harvest-betatron-power")
async def harvest_betatron_power(req: VanAllenHarvestRequest):
    return get_planetary_van_allen_radiation_belt_betatron_supergrid_service().harvest_betatron_power(
        belt_id=req.belt_id,
        cyclotron_multiplier=req.cyclotron_multiplier,
        betatron_efficiency=req.betatron_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_van_allen_radiation_belt_betatron_supergrid_service().get_metrics()
