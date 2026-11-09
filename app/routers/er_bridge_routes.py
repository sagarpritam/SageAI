from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.er_bridge_siphon import er_bridge_metric_siphon

router = APIRouter(
    prefix="/api/er-bridge",
    tags=["ER=EPR Spacetime Wormhole Metric Siphon (Cap 90)"],
)


class SiphonMetricFluxRequest(BaseModel):
    throat_id: str = Field(..., description="Target wormhole throat ID")
    target_energy_surge_source: str = Field(default="PROMPT_NUCLEAR_FIREBALL_SURGE", description="Surge source type")
    incident_power_gw: float = Field(default=650.0, ge=1.0, le=10000.0, description="Incident power in Gigawatts")


@router.get("/throats")
async def get_throats() -> List[Dict[str, Any]]:
    return er_bridge_metric_siphon.list_throats()


@router.post("/siphon-metric-flux")
async def siphon_metric_flux(req: SiphonMetricFluxRequest) -> Dict[str, Any]:
    try:
        return er_bridge_metric_siphon.siphon_metric_flux(
            throat_id=req.throat_id,
            target_energy_surge_source=req.target_energy_surge_source,
            incident_power_gw=req.incident_power_gw,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return er_bridge_metric_siphon.get_siphon_metrics()

