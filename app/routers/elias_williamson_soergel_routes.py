from fastapi import APIRouter
from pydantic import BaseModel
from app.services.elias_williamson_soergel_bimodule_barrier import (
    get_elias_williamson_soergel_bimodule_barrier_service,
)

router = APIRouter(prefix="/api/elias-williamson-soergel", tags=["Wave 75 Elias-Williamson Soergel"])


class SoergelHodgeRequest(BaseModel):
    bimodule_id: str = "ELIAS-WILLIAMSON-SOERGEL-01"
    hodge_rank: int = 3
    bott_samelson_length: int = 5
    barrier_gain: float = 1.25


@router.get("/bimodules")
async def list_bimodules():
    return get_elias_williamson_soergel_bimodule_barrier_service().list_bimodules()


@router.post("/evaluate-soergel-hodge")
async def evaluate_soergel_hodge(req: SoergelHodgeRequest):
    return get_elias_williamson_soergel_bimodule_barrier_service().evaluate_soergel_hodge(
        bimodule_id=req.bimodule_id,
        hodge_rank=req.hodge_rank,
        bott_samelson_length=req.bott_samelson_length,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_elias_williamson_soergel_bimodule_barrier_service().get_metrics()
