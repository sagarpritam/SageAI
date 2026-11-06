"""
FastAPI Router for Autonomous Sub-Surface Marine Acoustic Ocean Floor Sonar Mesh & Seismic Tamper Interceptor.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.marine_sonar.marine_acoustic_mesh import marine_acoustic_sonar_mesh

router = APIRouter(
    prefix="/marine-sonar",
    tags=["Marine Acoustic Ocean Floor Sonar Mesh"],
)


class AnalyzeAcousticTelemetryRequest(BaseModel):
    node_id: str = Field(..., description="Target ocean floor sonar node ID")
    sound_velocity_mps: float = Field(1495.0, description="Measured sound velocity in m/s")
    ambient_spl_db: float = Field(..., description="Ambient Sound Pressure Level in dB")
    spectral_peak_hz: float = Field(..., description="Dominant acoustic frequency peak in Hz")
    acoustic_doppler_mps: float = Field(..., description="Acoustic Doppler velocity shift in m/s")


class TriangulateContactRequest(BaseModel):
    node_id: str = Field(..., description="Sonar array node performing multi-lateration")
    bearing_deg: float = Field(142.5, description="Acoustic bearing angle in degrees")
    estimated_depth_m: float = Field(850.0, description="Estimated target depth in meters")


@router.get("/nodes")
@limiter.limit("60/minute")
async def list_nodes_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored ocean floor sonar arrays."""
    return {"status": "success", "nodes": marine_acoustic_sonar_mesh.list_nodes()}


@router.get("/nodes/{node_id}")
@limiter.limit("60/minute")
async def get_node_endpoint(
    request: Request,
    node_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific seabed sonar array."""
    node = marine_acoustic_sonar_mesh.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Marine sonar node not found")
    return {"status": "success", "node": node}


@router.post("/analyze-acoustic")
@limiter.limit("60/minute")
async def analyze_acoustic_endpoint(
    request: Request,
    body: AnalyzeAcousticTelemetryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Analyzes passive acoustic spectral signatures and detects UUV cavitation or cable tampering."""
    try:
        verdict = marine_acoustic_sonar_mesh.analyze_acoustic_telemetry(
            node_id=body.node_id,
            sound_velocity_mps=body.sound_velocity_mps,
            ambient_spl_db=body.ambient_spl_db,
            spectral_peak_hz=body.spectral_peak_hz,
            acoustic_doppler_mps=body.acoustic_doppler_mps,
        )
        return {"status": "success", "analysis": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/triangulate")
@limiter.limit("30/minute")
async def triangulate_contact_endpoint(
    request: Request,
    body: TriangulateContactRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes sub-18ms hyperbolic multi-lateration (TDOA) contact triangulation."""
    try:
        result = marine_acoustic_sonar_mesh.triangulate_acoustic_contact(
            node_id=body.node_id,
            bearing_deg=body.bearing_deg,
            estimated_depth_m=body.estimated_depth_m,
        )
        return {"status": "success", "triangulation_event": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_sonar_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns fleet telemetry for marine acoustic ocean floor defense."""
    return {"status": "success", "metrics": marine_acoustic_sonar_mesh.get_sonar_metrics()}

