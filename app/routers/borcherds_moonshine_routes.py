from fastapi import APIRouter
from pydantic import BaseModel
from app.services.borcherds_monster_moonshine_firewall import (
    get_borcherds_monster_moonshine_firewall_service,
)

router = APIRouter(prefix="/api/borcherds-moonshine", tags=["Wave 77 Borcherds Moonshine"])


class BorcherdsMoonshineRequest(BaseModel):
    moonshine_id: str = "BORCHERDS-MONSTER-VOA-01"
    denominator_rank: int = 2
    hauptmodul_order: int = 1
    firewall_gain: float = 1.25


@router.get("/algebras")
async def list_algebras():
    return get_borcherds_monster_moonshine_firewall_service().list_algebras()


@router.post("/evaluate-borcherds-moonshine")
async def evaluate_borcherds_moonshine(req: BorcherdsMoonshineRequest):
    return get_borcherds_monster_moonshine_firewall_service().evaluate_borcherds_moonshine(
        moonshine_id=req.moonshine_id,
        denominator_rank=req.denominator_rank,
        hauptmodul_order=req.hauptmodul_order,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_borcherds_monster_moonshine_firewall_service().get_metrics()
