from fastapi import APIRouter
from pydantic import BaseModel
from app.services.pandharipande_thomas_gv_bps_barrier import (
    get_pandharipande_thomas_gv_bps_barrier_service,
)

router = APIRouter(prefix="/api/pandharipande-thomas-bps", tags=["Wave 71 Pandharipande-Thomas BPS"])


class PtBpsRequest(BaseModel):
    pair_id: str = "PT-STABLE-PAIR-CY3-01"
    euler_char: int = 1
    curve_degree: int = 2
    barrier_gain: float = 1.25


@router.get("/pairs")
async def list_pairs():
    return get_pandharipande_thomas_gv_bps_barrier_service().list_pairs()


@router.post("/evaluate-pt-bps")
async def evaluate_pt_bps(req: PtBpsRequest):
    return get_pandharipande_thomas_gv_bps_barrier_service().evaluate_pt_bps(
        pair_id=req.pair_id,
        euler_char=req.euler_char,
        curve_degree=req.curve_degree,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_pandharipande_thomas_gv_bps_barrier_service().get_metrics()
