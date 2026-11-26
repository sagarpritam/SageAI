from fastapi import APIRouter
from pydantic import BaseModel
from app.services.kato_euler_system_p_adic_shield import (
    get_kato_euler_system_p_adic_shield_service,
)

router = APIRouter(prefix="/api/kato-euler-system", tags=["Wave 67 Kato Euler System"])


class KatoEulerRequest(BaseModel):
    system_id: str = "KATO-EULER-ZETA-01"
    prime_p: int = 5
    weight_k: int = 2
    shield_gain: float = 1.25


@router.get("/systems")
async def list_systems():
    return get_kato_euler_system_p_adic_shield_service().list_systems()


@router.post("/evaluate-euler-system")
async def evaluate_euler_system(req: KatoEulerRequest):
    return get_kato_euler_system_p_adic_shield_service().evaluate_euler_system(
        system_id=req.system_id,
        prime_p=req.prime_p,
        weight_k=req.weight_k,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_kato_euler_system_p_adic_shield_service().get_metrics()
