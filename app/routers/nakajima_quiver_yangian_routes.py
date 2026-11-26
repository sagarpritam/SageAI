from fastapi import APIRouter
from pydantic import BaseModel
from app.services.nakajima_quiver_variety_yangian_shield import (
    get_nakajima_quiver_variety_yangian_shield_service,
)

router = APIRouter(prefix="/api/nakajima-quiver-yangian", tags=["Wave 71 Nakajima Quiver"])


class QuiverYangianRequest(BaseModel):
    quiver_id: str = "NAKAJIMA-QUIVER-ADE-01"
    framing_rank: int = 2
    equivariant_weight: int = 3
    shield_gain: float = 1.25


@router.get("/quivers")
async def list_quivers():
    return get_nakajima_quiver_variety_yangian_shield_service().list_quivers()


@router.post("/evaluate-quiver-yangian")
async def evaluate_quiver_yangian(req: QuiverYangianRequest):
    return get_nakajima_quiver_variety_yangian_shield_service().evaluate_quiver_yangian(
        quiver_id=req.quiver_id,
        framing_rank=req.framing_rank,
        equivariant_weight=req.equivariant_weight,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_nakajima_quiver_variety_yangian_shield_service().get_metrics()
