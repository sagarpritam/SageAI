"""
FastAPI Router for Neuromorphic Spiking Neural Network (SNN) Sub-Microsecond Edge Threat Classifier.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.neuromorphic_snn.neuromorphic_snn_guard import neuromorphic_snn_guard

router = APIRouter(
    prefix="/neuromorphic-snn",
    tags=["Neuromorphic Spiking Neural Network (SNN) Edge Threat Classifier"],
)


class ClassifySpikeTrainRequest(BaseModel):
    core_id: str = Field(..., description="Target neuromorphic chip core identifier")
    mean_spike_rate_mhz: float = Field(..., description="Mean spike firing frequency in MHz")
    aer_inter_arrival_jitter_ns: float = Field(..., description="AER inter-arrival timing jitter in nanoseconds")
    voltage_anomaly_mv: float = Field(..., description="Measured voltage deviation in millivolts")
    bus_payload_entropy: float = Field(7.2, description="Shannon entropy of the bus payload")


class InjectInhibitoryClampRequest(BaseModel):
    core_id: str = Field(..., description="Target neuromorphic core to clamp")
    clamp_line: str = Field("BUS_LINE_RESET_ISOLATE", description="Hardware bus line to isolate")
    response_latency_ns: float = Field(385.0, description="Inhibitory clamp actuation speed in nanoseconds")


@router.get("/cores")
@limiter.limit("60/minute")
async def list_cores_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored neuromorphic silicon edge cores."""
    return {"status": "success", "cores": neuromorphic_snn_guard.list_cores()}


@router.get("/cores/{core_id}")
@limiter.limit("60/minute")
async def get_core_endpoint(
    request: Request,
    core_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific neuromorphic silicon core."""
    core = neuromorphic_snn_guard.get_core(core_id)
    if not core:
        raise HTTPException(status_code=404, detail="Neuromorphic core not found")
    return {"status": "success", "core": core}


@router.post("/classify-spikes")
@limiter.limit("60/minute")
async def classify_spikes_endpoint(
    request: Request,
    body: ClassifySpikeTrainRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Classifies asynchronous AER spike trains and detects nanosecond voltage glitches and DMA tampering."""
    try:
        verdict = neuromorphic_snn_guard.classify_spike_train(
            core_id=body.core_id,
            mean_spike_rate_mhz=body.mean_spike_rate_mhz,
            aer_inter_arrival_jitter_ns=body.aer_inter_arrival_jitter_ns,
            voltage_anomaly_mv=body.voltage_anomaly_mv,
            bus_payload_entropy=body.bus_payload_entropy,
        )
        return {"status": "success", "classification": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/inject-clamp")
@limiter.limit("30/minute")
async def inject_clamp_endpoint(
    request: Request,
    body: InjectInhibitoryClampRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Discharges sub-microsecond inhibitory GABA-ergic neuro-clamp isolating compromised bus lines."""
    try:
        result = neuromorphic_snn_guard.inject_inhibitory_clamp(
            core_id=body.core_id,
            clamp_line=body.clamp_line,
            response_latency_ns=body.response_latency_ns,
        )
        return {"status": "success", "clamp": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_neuromorphic_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns neuromorphic silicon fleet metrics."""
    return {"status": "success", "metrics": neuromorphic_snn_guard.get_neuromorphic_metrics()}

