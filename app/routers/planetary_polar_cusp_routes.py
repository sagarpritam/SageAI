from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_polar_cusp_solar_wind_funnel_supergrid import (
    get_planetary_polar_cusp_solar_wind_funnel_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-polar-cusp", tags=["Wave 74 Planetary Polar Cusp"])


class PolarCuspHarvestRequest(BaseModel):
    funnel_id: str = "POLAR-CUSP-NORTH-01"
    cusp_multiplier: float = 1.05
    funnel_efficiency: float = 0.994
    dispatch_duration_s: float = 60.0


@router.get("/funnels")
async def list_funnels():
    return get_planetary_polar_cusp_solar_wind_funnel_supergrid_service().list_funnels()


@router.post("/harvest-polar-cusp-power")
async def harvest_polar_cusp_power(req: PolarCuspHarvestRequest):
    return get_planetary_polar_cusp_solar_wind_funnel_supergrid_service().harvest_polar_cusp_power(
        funnel_id=req.funnel_id,
        cusp_multiplier=req.cusp_multiplier,
        funnel_efficiency=req.funnel_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_polar_cusp_solar_wind_funnel_supergrid_service().get_metrics()
