from fastapi import APIRouter
from pydantic import BaseModel
from app.services.pantev_toen_shifted_symplectic_barrier import (
    get_pantev_toen_shifted_symplectic_barrier_service,
)

router = APIRouter(prefix="/api/ptvv-shifted-symplectic", tags=["Wave 73 PTVV Shifted Symplectic"])


class ShiftedSymplecticRequest(BaseModel):
    stack_id: str = "PTVV-SHIFTED-SYMPLECTIC-01"
    symplectic_shift_n: int = -1
    lagrangian_rank: int = 3
    barrier_gain: float = 1.25


@router.get("/stacks")
async def list_stacks():
    return get_pantev_toen_shifted_symplectic_barrier_service().list_stacks()


@router.post("/evaluate-shifted-symplectic")
async def evaluate_shifted_symplectic(req: ShiftedSymplecticRequest):
    return get_pantev_toen_shifted_symplectic_barrier_service().evaluate_shifted_symplectic(
        stack_id=req.stack_id,
        symplectic_shift_n=req.symplectic_shift_n,
        lagrangian_rank=req.lagrangian_rank,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_pantev_toen_shifted_symplectic_barrier_service().get_metrics()
