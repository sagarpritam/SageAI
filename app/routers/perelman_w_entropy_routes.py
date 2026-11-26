from fastapi import APIRouter
from pydantic import BaseModel
from app.services.perelman_hamilton_ricci_entropy_barrier import (
    get_perelman_hamilton_ricci_entropy_barrier_service,
)

router = APIRouter(prefix="/api/perelman-w-entropy", tags=["Wave 70 Perelman W-Entropy"])


class WEntropyRequest(BaseModel):
    flow_id: str = "PERELMAN-W-ENTROPY-01"
    tau_scale: float = 1.5
    kappa_noncollapse: float = 0.95
    barrier_gain: float = 1.25


@router.get("/flows")
async def list_flows():
    return get_perelman_hamilton_ricci_entropy_barrier_service().list_flows()


@router.post("/evaluate-w-entropy")
async def evaluate_w_entropy(req: WEntropyRequest):
    return get_perelman_hamilton_ricci_entropy_barrier_service().evaluate_w_entropy(
        flow_id=req.flow_id,
        tau_scale=req.tau_scale,
        kappa_noncollapse=req.kappa_noncollapse,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_perelman_hamilton_ricci_entropy_barrier_service().get_metrics()
