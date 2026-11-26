from fastapi import APIRouter
from pydantic import BaseModel
from app.services.frenkel_ben_zvi_vertex_algebra_barrier import (
    get_frenkel_ben_zvi_vertex_algebra_barrier_service,
)

router = APIRouter(prefix="/api/frenkel-voa-chiral", tags=["Wave 77 Frenkel VOA Chiral"])


class VoaChiralRequest(BaseModel):
    voa_id: str = "FRENKEL-VOA-CHIRAL-01"
    central_charge_c: int = 24
    zhu_rank: int = 4
    barrier_gain: float = 1.25


@router.get("/algebras")
async def list_algebras():
    return get_frenkel_ben_zvi_vertex_algebra_barrier_service().list_algebras()


@router.post("/evaluate-voa-chiral")
async def evaluate_voa_chiral(req: VoaChiralRequest):
    return get_frenkel_ben_zvi_vertex_algebra_barrier_service().evaluate_voa_chiral(
        voa_id=req.voa_id,
        central_charge_c=req.central_charge_c,
        zhu_rank=req.zhu_rank,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_frenkel_ben_zvi_vertex_algebra_barrier_service().get_metrics()
