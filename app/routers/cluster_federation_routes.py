from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.cluster_federation import cluster_federation_engine

router = APIRouter(
    prefix="/api/cluster-federation",
    tags=["Enterprise Multi-Region Sovereign Cluster Federation (Option B)"],
)


class SyncClusterStateRequest(BaseModel):
    initiating_cluster_id: str = Field(default="CLUSTER-US-EAST-01", example="CLUSTER-US-EAST-01")
    target_cluster_id: str = Field(default="CLUSTER-EU-CENTRAL-02", example="CLUSTER-EU-CENTRAL-02")
    capabilities_count: int = Field(default=82, ge=1, le=100)


class AutomatedFailoverRequest(BaseModel):
    failing_cluster_id: str = Field(..., example="CLUSTER-EU-CENTRAL-02")
    backup_cluster_id: str = Field(default="CLUSTER-US-EAST-01", example="CLUSTER-US-EAST-01")
    reason: str = Field(default="SIMULATED_REGIONAL_EMP_ISOLATION", example="SIMULATED_REGIONAL_EMP_ISOLATION")


@router.get("/clusters")
async def get_clusters() -> List[Dict[str, Any]]:
    return cluster_federation_engine.list_clusters()


@router.post("/sync")
async def sync_cluster_state(req: SyncClusterStateRequest) -> Dict[str, Any]:
    try:
        return cluster_federation_engine.synchronize_cluster_state(
            initiating_cluster_id=req.initiating_cluster_id,
            target_cluster_id=req.target_cluster_id,
            capabilities_count=req.capabilities_count,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/failover")
async def trigger_failover(req: AutomatedFailoverRequest) -> Dict[str, Any]:
    try:
        return cluster_federation_engine.trigger_automated_failover(
            failing_cluster_id=req.failing_cluster_id,
            backup_cluster_id=req.backup_cluster_id,
            reason=req.reason,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return cluster_federation_engine.get_federation_metrics()

