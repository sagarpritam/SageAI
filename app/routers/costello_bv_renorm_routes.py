from fastapi import APIRouter
from pydantic import BaseModel
from app.services.costello_bv_renormalization_shield import (
    get_costello_bv_renormalization_shield_service,
)

router = APIRouter(prefix="/api/costello-bv-renorm", tags=["Wave 73 Costello BV Renorm"])


class CostelloBvRequest(BaseModel):
    theory_id: str = "COSTELLO-BV-RENORM-01"
    loop_order: int = 2
    scale_cutoff: float = 0.01
    shield_gain: float = 1.25


@router.get("/theories")
async def list_theories():
    return get_costello_bv_renormalization_shield_service().list_theories()


@router.post("/evaluate-bv-renorm")
async def evaluate_bv_renorm(req: CostelloBvRequest):
    return get_costello_bv_renormalization_shield_service().evaluate_bv_renorm(
        theory_id=req.theory_id,
        loop_order=req.loop_order,
        scale_cutoff=req.scale_cutoff,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_costello_bv_renormalization_shield_service().get_metrics()
