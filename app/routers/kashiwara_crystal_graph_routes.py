from fastapi import APIRouter
from pydantic import BaseModel
from app.services.kashiwara_crystal_graph_barrier import (
    get_kashiwara_crystal_graph_barrier_service,
)

router = APIRouter(prefix="/api/kashiwara-crystal-graph", tags=["Wave 76 Kashiwara Crystal Graph"])


class CrystalGraphRequest(BaseModel):
    crystal_id: str = "KASHIWARA-CRYSTAL-B-01"
    operator_rank: int = 6
    string_cone_dim: int = 4
    barrier_gain: float = 1.25


@router.get("/crystals")
async def list_crystals():
    return get_kashiwara_crystal_graph_barrier_service().list_crystals()


@router.post("/evaluate-crystal-graph")
async def evaluate_crystal_graph(req: CrystalGraphRequest):
    return get_kashiwara_crystal_graph_barrier_service().evaluate_crystal_graph(
        crystal_id=req.crystal_id,
        operator_rank=req.operator_rank,
        string_cone_dim=req.string_cone_dim,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_kashiwara_crystal_graph_barrier_service().get_metrics()
