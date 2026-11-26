from fastapi import APIRouter
from pydantic import BaseModel
from app.services.getzler_kapranov_operad_homotopy_firewall import (
    get_getzler_kapranov_operad_homotopy_firewall_service,
)

router = APIRouter(prefix="/api/getzler-kapranov-operad", tags=["Wave 72 Getzler-Kapranov Operad"])


class OperadBvRequest(BaseModel):
    operad_id: str = "GETZLER-KAPRANOV-MODULAR-01"
    genus_order: int = 2
    arity_n: int = 4
    firewall_gain: float = 1.25


@router.get("/operads")
async def list_operads():
    return get_getzler_kapranov_operad_homotopy_firewall_service().list_operads()


@router.post("/evaluate-operad-bv")
async def evaluate_operad_bv(req: OperadBvRequest):
    return get_getzler_kapranov_operad_homotopy_firewall_service().evaluate_operad_bv(
        operad_id=req.operad_id,
        genus_order=req.genus_order,
        arity_n=req.arity_n,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_getzler_kapranov_operad_homotopy_firewall_service().get_metrics()
