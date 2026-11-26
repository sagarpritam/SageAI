from fastapi import APIRouter
from pydantic import BaseModel
from app.services.beilinson_deligne_regulator_motive_barrier import (
    get_beilinson_deligne_regulator_motive_barrier_service,
)

router = APIRouter(prefix="/api/beilinson-deligne-regulator", tags=["Wave 69 Beilinson Regulator"])


class BeilinsonRegulatorRequest(BaseModel):
    regulator_id: str = "BEILINSON-REGULATOR-K2-01"
    motivic_weight: int = 2
    chow_codimension: int = 2
    barrier_gain: float = 1.25


@router.get("/regulators")
async def list_regulators():
    return get_beilinson_deligne_regulator_motive_barrier_service().list_regulators()


@router.post("/evaluate-beilinson-regulator")
async def evaluate_beilinson_regulator(req: BeilinsonRegulatorRequest):
    return get_beilinson_deligne_regulator_motive_barrier_service().evaluate_beilinson_regulator(
        regulator_id=req.regulator_id,
        motivic_weight=req.motivic_weight,
        chow_codimension=req.chow_codimension,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_beilinson_deligne_regulator_motive_barrier_service().get_metrics()
