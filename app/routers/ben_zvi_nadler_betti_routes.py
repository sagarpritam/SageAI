from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ben_zvi_nadler_spectral_langlands_barrier import (
    get_ben_zvi_nadler_spectral_langlands_barrier_service,
)

router = APIRouter(prefix="/api/ben-zvi-nadler-betti", tags=["Wave 74 Ben-Zvi-Nadler Betti"])


class BettiLanglandsRequest(BaseModel):
    stack_id: str = "BENZVI-NADLER-BETTI-01"
    nilpotent_rank: int = 3
    support_order: int = 2
    barrier_gain: float = 1.25


@router.get("/stacks")
async def list_stacks():
    return get_ben_zvi_nadler_spectral_langlands_barrier_service().list_stacks()


@router.post("/evaluate-betti-langlands")
async def evaluate_betti_langlands(req: BettiLanglandsRequest):
    return get_ben_zvi_nadler_spectral_langlands_barrier_service().evaluate_betti_langlands(
        stack_id=req.stack_id,
        nilpotent_rank=req.nilpotent_rank,
        support_order=req.support_order,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_ben_zvi_nadler_spectral_langlands_barrier_service().get_metrics()
