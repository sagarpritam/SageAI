from fastapi import APIRouter
from pydantic import BaseModel
from app.services.webster_klr_categorification_shield import (
    get_webster_klr_categorification_shield_service,
)

router = APIRouter(prefix="/api/webster-klr-cat", tags=["Wave 75 Webster KLR"])


class KlrTensorRequest(BaseModel):
    algebra_id: str = "WEBSTER-KLR-TENSOR-01"
    highest_weight_rank: int = 3
    strand_count: int = 6
    shield_gain: float = 1.25


@router.get("/algebras")
async def list_algebras():
    return get_webster_klr_categorification_shield_service().list_algebras()


@router.post("/evaluate-klr-tensor")
async def evaluate_klr_tensor(req: KlrTensorRequest):
    return get_webster_klr_categorification_shield_service().evaluate_klr_tensor(
        algebra_id=req.algebra_id,
        highest_weight_rank=req.highest_weight_rank,
        strand_count=req.strand_count,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_webster_klr_categorification_shield_service().get_metrics()
