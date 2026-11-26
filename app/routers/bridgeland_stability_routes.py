from fastapi import APIRouter
from pydantic import BaseModel
from app.services.bridgeland_stability_wall_crossing_barrier import (
    get_bridgeland_stability_wall_crossing_barrier_service,
)

router = APIRouter(prefix="/api/bridgeland-stability", tags=["Wave 72 Bridgeland Stability"])


class BridgelandStabilityRequest(BaseModel):
    manifold_id: str = "BRIDGELAND-STAB-K3-01"
    heart_shift: int = 1
    filtration_length: int = 3
    barrier_gain: float = 1.25


@router.get("/manifolds")
async def list_manifolds():
    return get_bridgeland_stability_wall_crossing_barrier_service().list_manifolds()


@router.post("/evaluate-bridgeland-stability")
async def evaluate_bridgeland_stability(req: BridgelandStabilityRequest):
    return get_bridgeland_stability_wall_crossing_barrier_service().evaluate_bridgeland_stability(
        manifold_id=req.manifold_id,
        heart_shift=req.heart_shift,
        filtration_length=req.filtration_length,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_bridgeland_stability_wall_crossing_barrier_service().get_metrics()
