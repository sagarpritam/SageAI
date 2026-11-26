from fastapi import APIRouter
from pydantic import BaseModel
from app.services.kapustin_witten_s_duality_shield import (
    get_kapustin_witten_s_duality_shield_service,
)

router = APIRouter(prefix="/api/kapustin-witten-sduality", tags=["Wave 74 Kapustin-Witten S-Duality"])


class SDualityRequest(BaseModel):
    braneline_id: str = "KAPUSTIN-WITTEN-SDUAL-01"
    hecke_rank: int = 3
    twist_t: float = 1.0
    shield_gain: float = 1.25


@router.get("/branelines")
async def list_branelines():
    return get_kapustin_witten_s_duality_shield_service().list_branelines()


@router.post("/evaluate-s-duality")
async def evaluate_s_duality(req: SDualityRequest):
    return get_kapustin_witten_s_duality_shield_service().evaluate_s_duality(
        braneline_id=req.braneline_id,
        hecke_rank=req.hecke_rank,
        twist_t=req.twist_t,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_kapustin_witten_s_duality_shield_service().get_metrics()
