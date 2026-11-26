from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_magnetospheric_plasmapause_whistler_supergrid import (
    get_planetary_magnetospheric_plasmapause_whistler_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-plasmapause", tags=["Wave 77 Planetary Plasmapause"])


class PlasmapauseHarvestRequest(BaseModel):
    waveguide_id: str = "PLASMAPAUSE-CHORUS-01"
    whistler_multiplier: float = 1.05
    waveguide_efficiency: float = 0.996
    dispatch_duration_s: float = 60.0


@router.get("/waveguides")
async def list_waveguides():
    return get_planetary_magnetospheric_plasmapause_whistler_supergrid_service().list_waveguides()


@router.post("/harvest-plasmapause-power")
async def harvest_plasmapause_power(req: PlasmapauseHarvestRequest):
    return get_planetary_magnetospheric_plasmapause_whistler_supergrid_service().harvest_plasmapause_power(
        waveguide_id=req.waveguide_id,
        whistler_multiplier=req.whistler_multiplier,
        waveguide_efficiency=req.waveguide_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_magnetospheric_plasmapause_whistler_supergrid_service().get_metrics()
