"""
FastAPI Router for Deep-Underground Neutrino-Flux Tamper & Nuclear Detonation Early Warning Array.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.core.rate_limit import limiter
from app.services.neutrino_array import neutrino_flux_detector

router = APIRouter(
    prefix="/neutrino-array",
    tags=["Deep-Underground Neutrino Early Warning Array"],
)


class AnalyzeNeutrinoFluxRequest(BaseModel):
    detector_id: str = Field(..., description="Target subterranean neutrino observatory ID")
    observed_prompt_energy_mev: float = Field(..., description="Observed prompt positron energy in MeV")
    delayed_coincidence_time_us: float = Field(22.5, description="Delayed neutron capture coincidence delay in μs")
    measured_flux_ev_per_day: float = Field(..., description="Measured antineutrino event rate per day")
    zenith_angle_deg: float = Field(..., description="Arrival zenith angle in degrees")
    azimuth_angle_deg: float = Field(..., description="Arrival azimuth angle in degrees")


class TriangulateFissileEventRequest(BaseModel):
    event_label: str = Field("UNANNOUNCED_SUBTERRANEAN_FISSILE_SURGE", description="Event descriptive label")
    reported_azimuth_angles: Dict[str, float] = Field(..., description="Mapping of detector ID to detected arrival azimuth")
    estimated_source_distance_km: float = Field(850.0, description="Estimated standoff distance in km")


@router.get("/detectors")
@limiter.limit("60/minute")
async def list_detectors_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all registered subterranean neutrino observatories."""
    return {"status": "success", "detectors": neutrino_flux_detector.list_detectors()}


@router.get("/detectors/{detector_id}")
@limiter.limit("60/minute")
async def get_detector_endpoint(
    request: Request,
    detector_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves telemetry of a specific subterranean neutrino detector."""
    det = neutrino_flux_detector.get_detector(detector_id)
    if not det:
        raise HTTPException(status_code=404, detail=f"Detector {detector_id} not found.")
    return {"status": "success", "detector": det}


@router.post("/analyze-flux")
@limiter.limit("30/minute")
async def analyze_flux_endpoint(
    request: Request,
    payload: AnalyzeNeutrinoFluxRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Analyzes observed antineutrino event flux for unannounced fission or detonations."""
    try:
        analysis = neutrino_flux_detector.analyze_neutrino_flux(
            detector_id=payload.detector_id,
            observed_prompt_energy_mev=payload.observed_prompt_energy_mev,
            delayed_coincidence_time_us=payload.delayed_coincidence_time_us,
            measured_flux_ev_per_day=payload.measured_flux_ev_per_day,
            zenith_angle_deg=payload.zenith_angle_deg,
            azimuth_angle_deg=payload.azimuth_angle_deg,
        )
        return {"status": "success", "analysis": analysis}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/triangulate-event")
@limiter.limit("30/minute")
async def triangulate_event_endpoint(
    request: Request,
    payload: TriangulateFissileEventRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Performs multi-lateral directional Cherenkov triangulation of subterranean fissile activity."""
    try:
        result = neutrino_flux_detector.triangulate_fissile_event(
            event_label=payload.event_label,
            reported_azimuth_angles=payload.reported_azimuth_angles,
            estimated_source_distance_km=payload.estimated_source_distance_km,
        )
        return {"status": "success", "triangulation": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves global subterranean neutrino monitoring metrics."""
    return {"status": "success", "metrics": neutrino_flux_detector.get_metrics()}
