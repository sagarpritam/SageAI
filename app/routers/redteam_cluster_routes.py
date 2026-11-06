from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.autonomous_redteam import autonomous_redteam_cluster

router = APIRouter(prefix="/api/redteam-cluster", tags=["Autonomous Red-Team Cluster (Option B)"])


class LaunchCampaignRequest(BaseModel):
    target_domains: Optional[List[str]] = Field(default=None, example=["ORBITAL_PNT", "QUANTUM_NETWORK", "PLASMA_SHIELD"])
    intensity: float = Field(default=0.85, ge=0.1, le=1.0)
    target_capabilities_count: int = Field(default=76, ge=1, le=100)


@router.get("/agents")
async def get_agents() -> List[Dict[str, Any]]:
    return autonomous_redteam_cluster.list_agents()


@router.post("/launch-campaign")
async def launch_campaign(req: LaunchCampaignRequest) -> Dict[str, Any]:
    try:
        return autonomous_redteam_cluster.launch_adversarial_campaign(
            target_domains=req.target_domains,
            intensity=req.intensity,
            target_capabilities_count=req.target_capabilities_count,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return autonomous_redteam_cluster.get_cluster_metrics()
