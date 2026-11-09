from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ryu_takayanagi_siphon import get_ryu_takayanagi_siphon

router = APIRouter(
    prefix="/api/ryu-takayanagi",
    tags=["Holographic Ryu-Takayanagi Entanglement Entropy Siphon (Cap 95)"],
)


class SiphonEntropyRequest(BaseModel):
    node_id: str = Field(..., description="Target boundary node ID")
    boundary_subsystem_length_l: float = Field(default=120.0, ge=1.0, le=10000.0, description="Boundary CFT subsystem length")
    siphon_flow_rate_gb_s: float = Field(default=48.0, ge=0.1, le=1000.0, description="Siphon drainage rate in GB/s")


@router.get("/nodes")
async def get_nodes() -> List[Dict[str, Any]]:
    siphon = get_ryu_takayanagi_siphon()
    return siphon.list_boundary_nodes()


@router.post("/siphon-entropy")
async def siphon_entropy(req: SiphonEntropyRequest) -> Dict[str, Any]:
    try:
        siphon = get_ryu_takayanagi_siphon()
        return siphon.siphon_boundary_entropy(
            node_id=req.node_id,
            boundary_subsystem_length_l=req.boundary_subsystem_length_l,
            siphon_flow_rate_gb_s=req.siphon_flow_rate_gb_s,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    siphon = get_ryu_takayanagi_siphon()
    return siphon.get_siphon_metrics()

