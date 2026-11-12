"""
FastAPI Router for Capability 122: Holographic Quantum Complexity (CA/CV & Switchback) Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.complexity_holography.complexity_holography import (
    get_complexity_holography_firewall,
)

router = APIRouter(
    prefix="/api/complexity-holography",
    tags=["Capability 122: Holographic Quantum Complexity Firewall"],
)


class AuditComplexityRequest(BaseModel):
    bound_id: str = Field(..., description="ID of the holographic complexity bound")
    central_charge: float = Field(
        default=240.0,
        ge=24.0,
        le=4096.0,
        description="Boundary CFT central charge / degrees of freedom",
    )
    lloyd_ratio: float = Field(
        default=0.94,
        ge=0.5,
        le=1.0,
        description="Normalized Lloyd rate saturation ratio dC/dt / (2M/pi*hbar)",
    )
    switchback_shocks: int = Field(
        default=4,
        ge=1,
        le=24,
        description="Number of shockwave switchback folds in WDW patch",
    )
    wdw_anchor_gain: float = Field(
        default=1.45,
        ge=0.85,
        le=2.5,
        description="Wheeler-DeWitt holographic stabilization gain",
    )


@router.get("/bounds")
async def list_bounds():
    """List all registered holographic complexity regimes."""
    fw = get_complexity_holography_firewall()
    return {"bounds": fw.get_bounds()}


@router.post("/audit-complexity")
async def audit_complexity_route(request: AuditComplexityRequest):
    """Audit Wheeler-DeWitt action and volume slices against the Lloyd complexity bound."""
    fw = get_complexity_holography_firewall()
    try:
        return fw.audit_complexity_patch(
            bound_id=request.bound_id,
            central_charge=request.central_charge,
            lloyd_ratio=request.lloyd_ratio,
            switchback_shocks=request.switchback_shocks,
            wdw_anchor_gain=request.wdw_anchor_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_complexity_metrics():
    """Retrieve aggregate holographic complexity firewall metrics."""
    fw = get_complexity_holography_firewall()
    return fw.get_complexity_metrics()
