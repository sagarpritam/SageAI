"""
FastAPI Router for Capability 149: Cluster Algebra Mutation & Stasheff Associahedron Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.cluster_algebra_associahedron.cluster_algebra_associahedron import (
    get_cluster_algebra_firewall,
)

router = APIRouter(
    prefix="/api/cluster-algebra-associahedron",
    tags=["Capability 149: Cluster Algebra & Stasheff Associahedron"],
)


class SealClusterRequest(BaseModel):
    cluster_id: str = Field(..., description="ID of the Cluster Algebra polytope")
    cluster_rank: int = Field(
        default=4, ge=2, le=16, description="Quiver cluster exchange rank"
    )
    stasheff_vertices: int = Field(
        default=14, ge=5, le=128, description="Stasheff associahedron vertex count"
    )
    quiver_mutation_depth: int = Field(
        default=12, ge=4, le=64, description="Quiver mutation step depth"
    )
    cluster_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Laurent positivity coherence gain",
    )


@router.get("/clusters")
async def list_cluster_polytopes():
    """List registered Cluster Algebra & Associahedron polytopes."""
    fw = get_cluster_algebra_firewall()
    return {"clusters": fw.get_clusters()}


@router.post("/seal-cluster")
async def seal_cluster_mutation_route(request: SealClusterRequest):
    """Seal quiver mutation sequence and lock Stasheff associahedron bounds."""
    fw = get_cluster_algebra_firewall()
    try:
        return fw.seal_cluster_mutation(
            cluster_id=request.cluster_id,
            cluster_rank=request.cluster_rank,
            stasheff_vertices=request.stasheff_vertices,
            quiver_mutation_depth=request.quiver_mutation_depth,
            cluster_gain=request.cluster_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_cluster_metrics():
    """Retrieve aggregate Cluster Algebra & Associahedron Firewall metrics."""
    fw = get_cluster_algebra_firewall()
    return fw.get_cluster_metrics()
