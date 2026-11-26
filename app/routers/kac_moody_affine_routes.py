from fastapi import APIRouter
from pydantic import BaseModel
from app.services.kac_moody_affine_lie_shield import (
    get_kac_moody_affine_lie_shield_service,
)

router = APIRouter(prefix="/api/kac-moody-affine", tags=["Wave 77 Kac-Moody Affine"])


class KacMoodyRequest(BaseModel):
    algebra_id: str = "KAC-MOODY-AFFINE-01"
    central_level_k: int = 2
    imaginary_root_mult: int = 4
    shield_gain: float = 1.25


@router.get("/algebras")
async def list_algebras():
    return get_kac_moody_affine_lie_shield_service().list_algebras()


@router.post("/evaluate-kac-moody")
async def evaluate_kac_moody(req: KacMoodyRequest):
    return get_kac_moody_affine_lie_shield_service().evaluate_kac_moody(
        algebra_id=req.algebra_id,
        central_level_k=req.central_level_k,
        imaginary_root_mult=req.imaginary_root_mult,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_kac_moody_affine_lie_shield_service().get_metrics()
