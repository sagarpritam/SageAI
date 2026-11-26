from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_exospheric_geocorona_solar_wind_supergrid import (
    get_planetary_exospheric_geocorona_solar_wind_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-exospheric-geocorona", tags=["Wave 69 Planetary Exospheric Geocorona"])


class ExosphericHarvestRequest(BaseModel):
    shell_id: str = "EXOSPHERE-GEOCORONA-LYMAN-01"
    reconnection_multiplier: float = 1.05
    reconnection_efficiency: float = 0.989
    dispatch_duration_s: float = 60.0


@router.get("/shells")
async def list_shells():
    return get_planetary_exospheric_geocorona_solar_wind_supergrid_service().list_shells()


@router.post("/harvest-exospheric-power")
async def harvest_exospheric_power(req: ExosphericHarvestRequest):
    return get_planetary_exospheric_geocorona_solar_wind_supergrid_service().harvest_exospheric_power(
        shell_id=req.shell_id,
        reconnection_multiplier=req.reconnection_multiplier,
        reconnection_efficiency=req.reconnection_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_exospheric_geocorona_solar_wind_supergrid_service().get_metrics()
