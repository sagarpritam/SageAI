"""
FastAPI Router for Sub-Millimeter High-Altitude Pseudo-Satellite (HAPS) Stratospheric Persistent Surveillance Swarm.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.haps_stratosphere.haps_stratosphere_mesh import haps_stratosphere_mesh

router = APIRouter(
    prefix="/haps-stratosphere",
    tags=["HAPS Stratospheric Persistent Surveillance Swarm"],
)


class MonitorStratosphericFlightRequest(BaseModel):
    node_id: str = Field(..., description="Target HAPS platform identifier")
    wind_velocity_mps: float = Field(
        ..., description="Stratospheric jet stream wind velocity in m/s"
    )
    battery_soc_pct: float = Field(
        ..., description="Solar battery state-of-charge percentage"
    )
    sar_clutter_ratio_db: float = Field(
        ..., description="SAR background radar clutter ratio in dB"
    )
    optical_link_jitter_urad: float = Field(
        ..., description="Inter-HAPS laser optical jitter in micro-radians"
    )


class RelaySARTelemetryRequest(BaseModel):
    node_id: str = Field(..., description="Target HAPS node to downlink from")
    frame_resolution_meters: float = Field(
        0.15, description="Synthetic Aperture Radar ground resolution in meters"
    )
    pqc_cipher: str = Field(
        "ML-DSA-87_AES256GCM", description="Post-quantum signing and encryption cipher"
    )


@router.get("/nodes")
@limiter.limit("60/minute")
async def list_nodes_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored stratospheric HAPS surveillance platforms."""
    return {"status": "success", "nodes": haps_stratosphere_mesh.list_nodes()}


@router.get("/nodes/{node_id}")
@limiter.limit("60/minute")
async def get_node_endpoint(
    request: Request,
    node_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific stratospheric HAPS node."""
    node = haps_stratosphere_mesh.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="HAPS node not found")
    return {"status": "success", "node": node}


@router.post("/monitor-flight")
@limiter.limit("60/minute")
async def monitor_flight_endpoint(
    request: Request,
    body: MonitorStratosphericFlightRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Monitors stratospheric aero-thermodynamics, jet stream station-keeping, and SAR noise."""
    try:
        verdict = haps_stratosphere_mesh.monitor_stratospheric_flight_and_sar(
            node_id=body.node_id,
            wind_velocity_mps=body.wind_velocity_mps,
            battery_soc_pct=body.battery_soc_pct,
            sar_clutter_ratio_db=body.sar_clutter_ratio_db,
            optical_link_jitter_urad=body.optical_link_jitter_urad,
        )
        return {"status": "success", "flight_monitor": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/relay-sar")
@limiter.limit("30/minute")
async def relay_sar_endpoint(
    request: Request,
    body: RelaySARTelemetryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Downlinks post-quantum encrypted, high-resolution Synthetic Aperture Radar (SAR) telemetry."""
    try:
        result = haps_stratosphere_mesh.relay_submillimeter_sar_telemetry(
            node_id=body.node_id,
            frame_resolution_meters=body.frame_resolution_meters,
            pqc_cipher=body.pqc_cipher,
        )
        return {"status": "success", "telemetry_event": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_haps_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns fleet telemetry for stratospheric persistent surveillance swarm."""
    return {"status": "success", "metrics": haps_stratosphere_mesh.get_haps_metrics()}
