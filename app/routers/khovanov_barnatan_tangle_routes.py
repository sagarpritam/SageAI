from fastapi import APIRouter
from pydantic import BaseModel
from app.services.bar_natan_khovanov_tangle_firewall import (
    get_bar_natan_khovanov_tangle_firewall_service,
)

router = APIRouter(prefix="/api/khovanov-barnatan-tangle", tags=["Wave 74 Khovanov-Bar-Natan Tangle"])


class KhovanovTangleRequest(BaseModel):
    tangle_id: str = "KHOVANOV-BARNATAN-COB-01"
    crossing_count: int = 7
    quantum_grading_j: int = 3
    firewall_gain: float = 1.25


@router.get("/tangles")
async def list_tangles():
    return get_bar_natan_khovanov_tangle_firewall_service().list_tangles()


@router.post("/evaluate-khovanov-tangle")
async def evaluate_khovanov_tangle(req: KhovanovTangleRequest):
    return get_bar_natan_khovanov_tangle_firewall_service().evaluate_khovanov_tangle(
        tangle_id=req.tangle_id,
        crossing_count=req.crossing_count,
        quantum_grading_j=req.quantum_grading_j,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_bar_natan_khovanov_tangle_firewall_service().get_metrics()
