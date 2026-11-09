"""
FastAPI Router for Sovereign Nation-State Critical Infrastructure Inter-Grid Autonomous Failover.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.intergrid_failover.intergrid_failover_guard import (
    intergrid_failover_guard,
)

router = APIRouter(
    prefix="/intergrid-failover",
    tags=["Sovereign Nation-State Inter-Grid Autonomous Failover"],
)


class EvaluateStabilityRequest(BaseModel):
    grid_id: str = Field(..., description="Target transmission interconnect identifier")
    frequency_hz: float = Field(
        ..., description="Measured synchrophasor frequency in Hz"
    )
    phase_angle_delta_deg: float = Field(
        ..., description="Measured phase angle difference in degrees"
    )
    rocof_hz_s: float = Field(
        ..., description="Rate of Change of Frequency in Hz/second"
    )


class IslandingRequest(BaseModel):
    grid_id: str = Field(..., description="Grid interconnect to island")
    reason: str = Field(
        "Imminent cyber-kinetic frequency collapse", description="Reason for islanding"
    )


@router.get("/interconnects")
@limiter.limit("60/minute")
async def list_interconnects_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored high-voltage transmission interconnections."""
    return {
        "status": "success",
        "interconnects": intergrid_failover_guard.list_interconnects(),
    }


@router.get("/interconnects/{grid_id}")
@limiter.limit("60/minute")
async def get_interconnect_endpoint(
    request: Request,
    grid_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific regional power grid."""
    grid = intergrid_failover_guard.get_interconnect(grid_id)
    if not grid:
        raise HTTPException(status_code=404, detail="Grid interconnect not found")
    return {"status": "success", "interconnect": grid}


@router.post("/evaluate-stability")
@limiter.limit("60/minute")
async def evaluate_stability_endpoint(
    request: Request,
    body: EvaluateStabilityRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Analyzes real-time PMU synchrophasor telemetry for frequency or phase collapse."""
    try:
        verdict = intergrid_failover_guard.evaluate_grid_stability(
            grid_id=body.grid_id,
            frequency_hz=body.frequency_hz,
            phase_angle_delta_deg=body.phase_angle_delta_deg,
            rocof_hz_s=body.rocof_hz_s,
        )
        return {"status": "success", "stability_analysis": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/trigger-islanding")
@limiter.limit("30/minute")
async def trigger_islanding_endpoint(
    request: Request,
    body: IslandingRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes sub-18ms micro-grid islanding to isolate critical infrastructure."""
    try:
        res = intergrid_failover_guard.trigger_autonomous_islanding(
            body.grid_id, body.reason
        )
        return {"status": "success", "islanding": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_intergrid_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns fleet metrics for all sovereign transmission interconnects."""
    return {
        "status": "success",
        "metrics": intergrid_failover_guard.get_intergrid_metrics(),
    }
