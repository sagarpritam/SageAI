from fastapi import APIRouter
from pydantic import BaseModel
from app.services.fomin_zelevinsky_cluster_algebra_firewall import (
    get_fomin_zelevinsky_cluster_algebra_firewall_service,
)

router = APIRouter(prefix="/api/fomin-zelevinsky-cluster", tags=["Wave 76 Fomin-Zelevinsky Cluster"])


class ClusterMutationRequest(BaseModel):
    cluster_id: str = "FOMIN-ZELEVINSKY-CLUSTER-01"
    seed_rank: int = 5
    mutation_depth: int = 4
    firewall_gain: float = 1.25


@router.get("/clusters")
async def list_clusters():
    return get_fomin_zelevinsky_cluster_algebra_firewall_service().list_clusters()


@router.post("/evaluate-cluster-mutation")
async def evaluate_cluster_mutation(req: ClusterMutationRequest):
    return get_fomin_zelevinsky_cluster_algebra_firewall_service().evaluate_cluster_mutation(
        cluster_id=req.cluster_id,
        seed_rank=req.seed_rank,
        mutation_depth=req.mutation_depth,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_fomin_zelevinsky_cluster_algebra_firewall_service().get_metrics()
