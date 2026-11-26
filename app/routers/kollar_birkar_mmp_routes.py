from fastapi import APIRouter
from pydantic import BaseModel
from app.services.kollar_birkar_mmp_log_canonical_shield import (
    get_kollar_birkar_mmp_log_canonical_shield_service,
)

router = APIRouter(prefix="/api/kollar-birkar-mmp", tags=["Wave 70 Kollar-Birkar MMP"])


class MmpThresholdRequest(BaseModel):
    model_id: str = "KOLLAR-LOG-CANONICAL-01"
    variety_dimension: int = 3
    epsilon_lc: float = 0.05
    shield_gain: float = 1.25


@router.get("/models")
async def list_models():
    return get_kollar_birkar_mmp_log_canonical_shield_service().list_models()


@router.post("/evaluate-mmp-threshold")
async def evaluate_mmp_threshold(req: MmpThresholdRequest):
    return get_kollar_birkar_mmp_log_canonical_shield_service().evaluate_mmp_threshold(
        model_id=req.model_id,
        variety_dimension=req.variety_dimension,
        epsilon_lc=req.epsilon_lc,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_kollar_birkar_mmp_log_canonical_shield_service().get_metrics()
