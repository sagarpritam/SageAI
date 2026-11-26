from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_magnetotail_reconnection_plasmoid_supergrid import (
    get_planetary_magnetotail_reconnection_plasmoid_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-magnetotail", tags=["Wave 72 Planetary Magnetotail"])


class MagnetotailHarvestRequest(BaseModel):
    lobe_id: str = "MAGNETOTAIL-XLINE-01"
    plasmoid_multiplier: float = 1.05
    reconnection_efficiency: float = 0.992
    dispatch_duration_s: float = 60.0


@router.get("/lobes")
async def list_lobes():
    return get_planetary_magnetotail_reconnection_plasmoid_supergrid_service().list_lobes()


@router.post("/harvest-magnetotail-power")
async def harvest_magnetotail_power(req: MagnetotailHarvestRequest):
    return get_planetary_magnetotail_reconnection_plasmoid_supergrid_service().harvest_magnetotail_power(
        lobe_id=req.lobe_id,
        plasmoid_multiplier=req.plasmoid_multiplier,
        reconnection_efficiency=req.reconnection_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_magnetotail_reconnection_plasmoid_supergrid_service().get_metrics()
