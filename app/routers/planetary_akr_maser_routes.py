from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_aurora_kilometric_radiation_maser_supergrid import (
    get_planetary_aurora_kilometric_radiation_maser_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-akr-maser", tags=["Wave 75 Planetary AKR Maser"])


class AkrHarvestRequest(BaseModel):
    cavity_id: str = "AKR-CAVITY-BOREAL-01"
    maser_multiplier: float = 1.05
    maser_efficiency: float = 0.995
    dispatch_duration_s: float = 60.0


@router.get("/cavities")
async def list_cavities():
    return get_planetary_aurora_kilometric_radiation_maser_supergrid_service().list_cavities()


@router.post("/harvest-akr-power")
async def harvest_akr_power(req: AkrHarvestRequest):
    return get_planetary_aurora_kilometric_radiation_maser_supergrid_service().harvest_akr_power(
        cavity_id=req.cavity_id,
        maser_multiplier=req.maser_multiplier,
        maser_efficiency=req.maser_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_aurora_kilometric_radiation_maser_supergrid_service().get_metrics()
