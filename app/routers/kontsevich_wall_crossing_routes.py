from fastapi import APIRouter
from pydantic import BaseModel
from app.services.kontsevich_soibelman_wall_crossing_firewall import (
    get_kontsevich_soibelman_wall_crossing_firewall_service,
)

router = APIRouter(prefix="/api/kontsevich-wall-crossing", tags=["Wave 70 Kontsevich Wall-Crossing"])


class WallCrossingRequest(BaseModel):
    chamber_id: str = "KONTSEVICH-SOIBELMAN-01"
    bps_charge_rank: int = 2
    dt_invariant_order: int = 4
    firewall_gain: float = 1.25


@router.get("/chambers")
async def list_chambers():
    return get_kontsevich_soibelman_wall_crossing_firewall_service().list_chambers()


@router.post("/evaluate-wall-crossing")
async def evaluate_wall_crossing(req: WallCrossingRequest):
    return get_kontsevich_soibelman_wall_crossing_firewall_service().evaluate_wall_crossing(
        chamber_id=req.chamber_id,
        bps_charge_rank=req.bps_charge_rank,
        dt_invariant_order=req.dt_invariant_order,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_kontsevich_soibelman_wall_crossing_firewall_service().get_metrics()
