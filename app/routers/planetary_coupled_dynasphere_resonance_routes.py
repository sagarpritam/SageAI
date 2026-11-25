"""
FastAPI Router for Planetary Core-Mantle-Inner-Core Coupled Resonant Dynasphere Supergrid (Option B Wave 60).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.planetary_coupled_dynasphere_resonance_supergrid import (
    get_planetary_coupled_dynasphere_resonance_supergrid_service,
)

router = APIRouter(
    prefix="/api/planetary-coupled-dynasphere-resonance",
    tags=["Planetary Coupled Dynasphere Resonance Supergrid"],
)

class HarvestDynaspherePowerRequest(BaseModel):
    node_id: str = Field(..., description="ID of dynasphere node to dispatch power from")
    resonance_multiplier_override: Optional[float] = Field(1.05, description="Resonance multiplier")
    telluric_waveguide_efficiency: Optional[float] = Field(0.96, description="Telluric waveguide efficiency")
    dispatch_duration_s: Optional[float] = Field(60.0, description="Dispatch duration in seconds")

@router.get("/nodes")
async def list_nodes():
    service = get_planetary_coupled_dynasphere_resonance_supergrid_service()
    return {"nodes": service.list_nodes()}

@router.post("/harvest-dynasphere-resonance-power")
async def harvest_dynasphere_resonance_power(request: HarvestDynaspherePowerRequest):
    service = get_planetary_coupled_dynasphere_resonance_supergrid_service()
    try:
        return service.harvest_dynasphere_resonance_power(
            node_id=request.node_id,
            resonance_multiplier_override=request.resonance_multiplier_override if request.resonance_multiplier_override is not None else 1.05,
            telluric_waveguide_efficiency=request.telluric_waveguide_efficiency if request.telluric_waveguide_efficiency is not None else 0.96,
            dispatch_duration_s=request.dispatch_duration_s if request.dispatch_duration_s is not None else 60.0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_planetary_coupled_dynasphere_resonance_supergrid_service()
    return service.get_metrics()
