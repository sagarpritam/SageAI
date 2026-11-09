"""
FastAPI Router for Cognitive Electronic Warfare (EW) Autonomous Radar Waveform Synthesis & Deception.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.cognitive_ew import cognitive_ew_engine

router = APIRouter(
    prefix="/cognitive-ew",
    tags=["Cognitive Electronic Warfare & Radar Deception"],
)


class SynthesizeWaveformRequest(BaseModel):
    emitter_id: str = Field(..., description="Target adversary radar emitter ID")
    carrier_frequency_ghz: float = Field(9.85, description="Intercepted carrier frequency in GHz")
    pulse_width_us: float = Field(12.5, description="Pulse width in microseconds")
    snr_db: float = Field(24.5, description="Signal-to-noise ratio in dB")
    technique: str = Field("RANGE_GATE_PULL_OFF_RGPO", description="DRFM deception technique")


class EngageCountermeasureRequest(BaseModel):
    emitter_id: str = Field(..., description="Target adversary radar emitter ID to neutralize")
    technique: str = Field("RANGE_GATE_PULL_OFF_RGPO", description="DRFM deception technique")
    duration_ms: float = Field(250.0, description="Jamming burst duration in ms")


@router.get("/emitters")
@limiter.limit("60/minute")
async def list_emitters_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all tracked adversary radar emitters."""
    return {"status": "success", "emitters": cognitive_ew_engine.list_emitters()}


@router.get("/emitters/{emitter_id}")
@limiter.limit("60/minute")
async def get_emitter_endpoint(
    request: Request,
    emitter_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves telemetry of a specific adversary radar emitter."""
    emitter = cognitive_ew_engine.get_emitter(emitter_id)
    if not emitter:
        raise HTTPException(status_code=404, detail=f"Emitter {emitter_id} not found.")
    return {"status": "success", "emitter": emitter}


@router.post("/synthesize-waveform")
@limiter.limit("30/minute")
async def synthesize_waveform_endpoint(
    request: Request,
    payload: SynthesizeWaveformRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Synthesizes closed-loop DRFM deceptive radar waveform in <5 μs."""
    try:
        pdw = {
            "carrier_frequency_ghz": payload.carrier_frequency_ghz,
            "pulse_width_us": payload.pulse_width_us,
            "snr_db": payload.snr_db,
        }
        waveform = cognitive_ew_engine.synthesize_drfm_waveform(
            emitter_id=payload.emitter_id,
            pulse_descriptor=pdw,
            technique=payload.technique,
        )
        return {"status": "success", "waveform": waveform}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/engage-countermeasure")
@limiter.limit("30/minute")
async def engage_countermeasure_endpoint(
    request: Request,
    payload: EngageCountermeasureRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Transmits deceptive DRFM waveform to break adversary radar track."""
    try:
        result = cognitive_ew_engine.engage_countermeasure(
            emitter_id=payload.emitter_id,
            technique=payload.technique,
            duration_ms=payload.duration_ms,
        )
        return {"status": "success", "engagement": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves Cognitive EW performance metrics."""
    return {"status": "success", "metrics": cognitive_ew_engine.get_metrics()}
