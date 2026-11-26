from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gross_zagier_heegner_height_barrier import (
    get_gross_zagier_heegner_height_barrier_service,
)

router = APIRouter(prefix="/api/gross-zagier-heegner", tags=["Wave 67 Gross-Zagier Heegner"])


class HeightPairingRequest(BaseModel):
    pairing_id: str = "GROSS-ZAGIER-HEEGNER-01"
    conductor_n: int = 37
    analytic_rank: int = 1
    barrier_gain: float = 1.25


@router.get("/pairings")
async def list_pairings():
    return get_gross_zagier_heegner_height_barrier_service().list_pairings()


@router.post("/evaluate-height-pairing")
async def evaluate_height_pairing(req: HeightPairingRequest):
    return get_gross_zagier_heegner_height_barrier_service().evaluate_height_pairing(
        pairing_id=req.pairing_id,
        conductor_n=req.conductor_n,
        analytic_rank=req.analytic_rank,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_gross_zagier_heegner_height_barrier_service().get_metrics()
