"""
FastAPI Router for Autonomous Geomagnetic Solar Storm (CME) Induced GIC Power Grid Shielding.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.geomagnetic_shield.geomagnetic_solar_shield import geomagnetic_solar_shield

router = APIRouter(
    prefix="/geomagnetic-shield",
    tags=["Geomagnetic Solar Storm (CME) GIC Power Grid Shielding"],
)


class EvaluateGeomagneticStormRequest(BaseModel):
    substation_id: str = Field(..., description="Target EHV substation identifier")
    kp_index: float = Field(..., description="Planetary geomagnetic Kp storm index (0.0 to 9.0+)")
    db_dt_nt_per_min: float = Field(..., description="Rate of magnetic field change in nT/min")
    measured_gic_amps: float = Field(..., description="Quasi-DC GIC current in Amperes")


class TriggerNeutralBlockingRequest(BaseModel):
    substation_id: str = Field(..., description="Substation to shield with series capacitor / NGR")
    damping_resistance_ohms: float = Field(12.5, description="Neutral grounding damping resistance in ohms")
    tripping_latency_ms: float = Field(9.4, description="Breaker actuation time in milliseconds")


@router.get("/substations")
@limiter.limit("60/minute")
async def list_substations_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored EHV power grid transmission substations."""
    return {"status": "success", "substations": geomagnetic_solar_shield.list_substations()}


@router.get("/substations/{substation_id}")
@limiter.limit("60/minute")
async def get_substation_endpoint(
    request: Request,
    substation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific EHV power substation."""
    substation = geomagnetic_solar_shield.get_substation(substation_id)
    if not substation:
        raise HTTPException(status_code=404, detail="Substation not found")
    return {"status": "success", "substation": substation}


@router.post("/evaluate-storm")
@limiter.limit("60/minute")
async def evaluate_storm_endpoint(
    request: Request,
    body: EvaluateGeomagneticStormRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Evaluates planetary magnetosphere storm perturbation and transformer core saturation risks."""
    try:
        verdict = geomagnetic_solar_shield.evaluate_geomagnetic_storm(
            substation_id=body.substation_id,
            kp_index=body.kp_index,
            db_dt_nt_per_min=body.db_dt_nt_per_min,
            measured_gic_amps=body.measured_gic_amps,
        )
        return {"status": "success", "evaluation": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/trigger-blocking")
@limiter.limit("30/minute")
async def trigger_blocking_endpoint(
    request: Request,
    body: TriggerNeutralBlockingRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Inserts series blocking capacitor and neutral grounding damping resistor in sub-12ms."""
    try:
        result = geomagnetic_solar_shield.trigger_neutral_blocking_shield(
            substation_id=body.substation_id,
            damping_resistance_ohms=body.damping_resistance_ohms,
            tripping_latency_ms=body.tripping_latency_ms,
        )
        return {"status": "success", "blocking_event": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_geomagnetic_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns fleet telemetry for planetary geomagnetic CME power grid shielding."""
    return {"status": "success", "metrics": geomagnetic_solar_shield.get_geomagnetic_metrics()}

