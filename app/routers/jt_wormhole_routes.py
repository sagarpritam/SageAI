"""
FastAPI Router for Capability 125: JT Dilaton Wormhole & Double-Scaled Matrix Model Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.jt_wormhole_matrix.jt_wormhole_matrix import (
    get_jt_wormhole_matrix_firewall,
)

router = APIRouter(
    prefix="/api/jt-wormhole-matrix",
    tags=["Capability 125: JT Dilaton Wormhole & Matrix Model Firewall"],
)


class SealWormholeRequest(BaseModel):
    topology_id: str = Field(..., description="ID of the JT wormhole matrix topology")
    genus_g: int = Field(
        default=2,
        ge=0,
        le=16,
        description="Handlebody genus order in SSS topological expansion",
    )
    s0_entropy: float = Field(
        default=8.4,
        ge=4.0,
        le=20.0,
        description="Extremal ground-state entropy S_0 suppressing higher genera",
    )
    schwarzian_temp: float = Field(
        default=1.25,
        ge=0.25,
        le=5.0,
        description="Boundary Schwarzian temperature parameter",
    )
    trumpet_clamp_gain: float = Field(
        default=1.5,
        ge=0.85,
        le=2.5,
        description="Wormhole throat trumpet stabilization gain",
    )


@router.get("/topologies")
async def list_topologies():
    """List all registered JT wormhole matrix topologies."""
    fw = get_jt_wormhole_matrix_firewall()
    return {"topologies": fw.get_topologies()}


@router.post("/seal-wormhole")
async def seal_wormhole_route(request: SealWormholeRequest):
    """Seal JT dilaton genus-g wormhole factorization leaks."""
    fw = get_jt_wormhole_matrix_firewall()
    try:
        return fw.seal_wormhole_genus(
            topology_id=request.topology_id,
            genus_g=request.genus_g,
            s0_entropy=request.s0_entropy,
            schwarzian_temp=request.schwarzian_temp,
            trumpet_clamp_gain=request.trumpet_clamp_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_jt_wormhole_metrics():
    """Retrieve aggregate JT wormhole matrix firewall metrics."""
    fw = get_jt_wormhole_matrix_firewall()
    return fw.get_jt_wormhole_metrics()
