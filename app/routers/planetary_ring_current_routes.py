from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_ring_current_plasmasphere_alfven_supergrid import (
    get_planetary_ring_current_plasmasphere_alfven_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-ring-current", tags=["Wave 71 Planetary Ring Current"])


class RingCurrentHarvestRequest(BaseModel):
    torus_id: str = "RING-CURRENT-TORUS-01"
    alfven_multiplier: float = 1.05
    alfven_efficiency: float = 0.991
    dispatch_duration_s: float = 60.0


@router.get("/tori")
async def list_tori():
    return get_planetary_ring_current_plasmasphere_alfven_supergrid_service().list_tori()


@router.post("/harvest-ring-current-power")
async def harvest_ring_current_power(req: RingCurrentHarvestRequest):
    return get_planetary_ring_current_plasmasphere_alfven_supergrid_service().harvest_ring_current_power(
        torus_id=req.torus_id,
        alfven_multiplier=req.alfven_multiplier,
        alfven_efficiency=req.alfven_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_ring_current_plasmasphere_alfven_supergrid_service().get_metrics()
