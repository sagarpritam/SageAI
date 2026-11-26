from fastapi import APIRouter
from pydantic import BaseModel
from app.services.mazur_eisenstein_ideal_torsion_shield import (
    get_mazur_eisenstein_ideal_torsion_shield_service,
)

router = APIRouter(prefix="/api/mazur-eisenstein-torsion", tags=["Wave 66 Mazur Eisenstein"])


class EisensteinTorsionRequest(BaseModel):
    curve_id: str = "MAZUR-EISENSTEIN-X0-11-01"
    prime_n: int = 11
    torsion_order: int = 5
    shield_gain: float = 1.25


@router.get("/curves")
async def list_curves():
    return get_mazur_eisenstein_ideal_torsion_shield_service().list_curves()


@router.post("/evaluate-eisenstein-torsion")
async def evaluate_eisenstein_torsion(req: EisensteinTorsionRequest):
    return get_mazur_eisenstein_ideal_torsion_shield_service().evaluate_eisenstein_torsion(
        curve_id=req.curve_id,
        prime_n=req.prime_n,
        torsion_order=req.torsion_order,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_mazur_eisenstein_ideal_torsion_shield_service().get_metrics()
