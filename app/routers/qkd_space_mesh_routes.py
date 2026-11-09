from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.qkd_space_mesh_relay import qkd_space_mesh_relay

router = APIRouter(
    prefix="/api/qkd-space-mesh",
    tags=["Sovereign Interstellar QKD Space-Mesh Relay (Option B)"],
)


class SwapEntanglementRequest(BaseModel):
    origin_node_id: str = Field(
        default="QKD-EARTH-CANARY-01", examples=["QKD-EARTH-CANARY-01"]
    )
    relay_node_id: str = Field(
        default="QKD-RELAY-LAGRANGE-L1-03", examples=["QKD-RELAY-LAGRANGE-L1-03"]
    )
    destination_node_id: str = Field(
        default="QKD-PROBE-MARS-ORBIT-04", examples=["QKD-PROBE-MARS-ORBIT-04"]
    )


@router.get("/nodes")
async def get_nodes() -> List[Dict[str, Any]]:
    return qkd_space_mesh_relay.list_nodes()


@router.post("/swap-entanglement")
async def swap_entanglement(req: SwapEntanglementRequest) -> Dict[str, Any]:
    try:
        return qkd_space_mesh_relay.swap_entanglement(
            origin_node_id=req.origin_node_id,
            relay_node_id=req.relay_node_id,
            destination_node_id=req.destination_node_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return qkd_space_mesh_relay.get_mesh_metrics()
