from fastapi import APIRouter
from pydantic import BaseModel
from app.services.szpiro_abc_height_discriminant_shield import (
    get_szpiro_abc_height_discriminant_shield_service,
)

router = APIRouter(prefix="/api/szpiro-abc-height", tags=["Wave 68 Szpiro ABC Height"])


class AbcRadicalRequest(BaseModel):
    bound_id: str = "SZPIRO-DISCRIMINANT-01"
    conductor_n: int = 11
    szpiro_exponent: float = 6.0
    shield_gain: float = 1.25


@router.get("/bounds")
async def list_bounds():
    return get_szpiro_abc_height_discriminant_shield_service().list_bounds()


@router.post("/evaluate-abc-radical")
async def evaluate_abc_radical(req: AbcRadicalRequest):
    return get_szpiro_abc_height_discriminant_shield_service().evaluate_abc_radical(
        bound_id=req.bound_id,
        conductor_n=req.conductor_n,
        szpiro_exponent=req.szpiro_exponent,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_szpiro_abc_height_discriminant_shield_service().get_metrics()
