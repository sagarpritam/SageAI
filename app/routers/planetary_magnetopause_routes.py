from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_magnetopause_kelvin_helmholtz_vortex_supergrid import (
    get_planetary_magnetopause_kelvin_helmholtz_vortex_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-magnetopause", tags=["Wave 73 Planetary Magnetopause"])


class MagnetopauseHarvestRequest(BaseModel):
    vortex_id: str = "MAGNETOPAUSE-KH-DAWN-01"
    vortex_multiplier: float = 1.05
    kh_efficiency: float = 0.993
    dispatch_duration_s: float = 60.0


@router.get("/vortices")
async def list_vortices():
    return get_planetary_magnetopause_kelvin_helmholtz_vortex_supergrid_service().list_vortices()


@router.post("/harvest-magnetopause-power")
async def harvest_magnetopause_power(req: MagnetopauseHarvestRequest):
    return get_planetary_magnetopause_kelvin_helmholtz_vortex_supergrid_service().harvest_magnetopause_power(
        vortex_id=req.vortex_id,
        vortex_multiplier=req.vortex_multiplier,
        kh_efficiency=req.kh_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_magnetopause_kelvin_helmholtz_vortex_supergrid_service().get_metrics()
