from fastapi import APIRouter
from pydantic import BaseModel
from app.services.andre_oort_shimura_special_points_barrier import (
    get_andre_oort_shimura_special_points_barrier_service,
)

router = APIRouter(prefix="/api/andre-oort-shimura", tags=["Wave 68 Andre-Oort Shimura"])


class SpecialPointsRequest(BaseModel):
    variety_id: str = "ANDRE-OORT-CM-POINTS-01"
    shimura_dimension: int = 2
    cm_discriminant: int = 19
    barrier_gain: float = 1.25


@router.get("/varieties")
async def list_varieties():
    return get_andre_oort_shimura_special_points_barrier_service().list_varieties()


@router.post("/evaluate-special-points")
async def evaluate_special_points(req: SpecialPointsRequest):
    return get_andre_oort_shimura_special_points_barrier_service().evaluate_special_points(
        variety_id=req.variety_id,
        shimura_dimension=req.shimura_dimension,
        cm_discriminant=req.cm_discriminant,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_andre_oort_shimura_special_points_barrier_service().get_metrics()
