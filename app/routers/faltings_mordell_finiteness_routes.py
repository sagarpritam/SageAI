from fastapi import APIRouter
from pydantic import BaseModel
from app.services.faltings_mordell_height_finiteness_firewall import (
    get_faltings_mordell_height_finiteness_firewall_service,
)

router = APIRouter(prefix="/api/faltings-mordell-finiteness", tags=["Wave 67 Faltings Mordell"])


class MordellFinitenessRequest(BaseModel):
    curve_id: str = "FALTINGS-MORDELL-GENUS2-01"
    genus_g: int = 2
    bad_primes_count: int = 3
    firewall_gain: float = 1.25


@router.get("/curves")
async def list_curves():
    return get_faltings_mordell_height_finiteness_firewall_service().list_curves()


@router.post("/evaluate-mordell-finiteness")
async def evaluate_mordell_finiteness(req: MordellFinitenessRequest):
    return get_faltings_mordell_height_finiteness_firewall_service().evaluate_mordell_finiteness(
        curve_id=req.curve_id,
        genus_g=req.genus_g,
        bad_primes_count=req.bad_primes_count,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_faltings_mordell_height_finiteness_firewall_service().get_metrics()
