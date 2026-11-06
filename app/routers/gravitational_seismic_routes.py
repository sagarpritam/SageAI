"""
FastAPI Router for Gravitational Wave Seismic Tamper & Sub-Crustal Tectonic Displacement Sensor Mesh.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.core.rate_limit import limiter
from app.services.gravitational_seismic import gravitational_seismic_mesh

router = APIRouter(
    prefix="/gravitational-seismic",
    tags=["Gravitational Seismic Sub-Crustal Sensor Mesh"],
)


class AnalyzeStrainRequest(BaseModel):
    observatory_id: str = Field(..., description="Target subterranean laser strain observatory ID")
    measured_strain_h: float = Field(..., description="Measured differential spacetime strain h = ΔL / L")
    dominant_frequency_hz: float = Field(..., description="Dominant oscillation frequency in Hz")
    p_wave_velocity_km_s: float = Field(6.2, description="Compressional P-wave velocity in km/s")
    s_wave_velocity_km_s: float = Field(3.5, description="Shear S-wave velocity in km/s")


class TriangulateSubcrustalRequest(BaseModel):
    event_label: str = Field("SUSPECTED_SUBCRUSTAL_EXCAVATION", description="Descriptive event label")
    sensor_arrival_times_ms: Dict[str, float] = Field(..., description="Mapping of observatory ID to arrival time in ms")
    assumed_depth_km: float = Field(4.5, description="Estimated subterranean depth in km")


@router.get("/observatories")
@limiter.limit("60/minute")
async def list_observatories_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all registered subterranean laser strain observatories."""
    return {"status": "success", "observatories": gravitational_seismic_mesh.list_observatories()}


@router.get("/observatories/{observatory_id}")
@limiter.limit("60/minute")
async def get_observatory_endpoint(
    request: Request,
    observatory_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves telemetry of a specific subterranean strain observatory."""
    obs = gravitational_seismic_mesh.get_observatory(observatory_id)
    if not obs:
        raise HTTPException(status_code=404, detail=f"Observatory {observatory_id} not found.")
    return {"status": "success", "observatory": obs}


@router.post("/analyze-strain")
@limiter.limit("30/minute")
async def analyze_strain_endpoint(
    request: Request,
    payload: AnalyzeStrainRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Analyzes measured differential strain tensor for sub-crustal nuclear/boring tamper."""
    try:
        analysis = gravitational_seismic_mesh.analyze_strain_telemetry(
            observatory_id=payload.observatory_id,
            measured_strain_h=payload.measured_strain_h,
            dominant_frequency_hz=payload.dominant_frequency_hz,
            p_wave_velocity_km_s=payload.p_wave_velocity_km_s,
            s_wave_velocity_km_s=payload.s_wave_velocity_km_s,
        )
        return {"status": "success", "analysis": analysis}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/triangulate-tamper")
@limiter.limit("30/minute")
async def triangulate_tamper_endpoint(
    request: Request,
    payload: TriangulateSubcrustalRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes geodetic TDOA triangulation of clandestine sub-crustal excavations or detonations."""
    try:
        triangulation = gravitational_seismic_mesh.triangulate_subcrustal_tamper(
            event_label=payload.event_label,
            sensor_arrival_times_ms=payload.sensor_arrival_times_ms,
            assumed_depth_km=payload.assumed_depth_km,
        )
        return {"status": "success", "triangulation": triangulation}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves planetary sub-crustal strain monitoring metrics."""
    return {"status": "success", "metrics": gravitational_seismic_mesh.get_metrics()}

