from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ribet_level_lowering_serre_barrier import (
    get_ribet_level_lowering_serre_barrier_service,
)

router = APIRouter(prefix="/api/ribet-level-lowering", tags=["Wave 66 Ribet Level-Lowering"])


class LevelLoweringRequest(BaseModel):
    form_id: str = "RIBET-LEVEL-LOWER-P5-01"
    residual_prime_p: int = 5
    serre_weight_k: int = 2
    barrier_gain: float = 1.25


@router.get("/forms")
async def list_forms():
    return get_ribet_level_lowering_serre_barrier_service().list_forms()


@router.post("/evaluate-level-lowering")
async def evaluate_level_lowering(req: LevelLoweringRequest):
    return get_ribet_level_lowering_serre_barrier_service().evaluate_level_lowering(
        form_id=req.form_id,
        residual_prime_p=req.residual_prime_p,
        serre_weight_k=req.serre_weight_k,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_ribet_level_lowering_serre_barrier_service().get_metrics()
