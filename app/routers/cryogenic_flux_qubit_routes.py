"""
FastAPI Router for Capability 163: 15 mK Cryogenic Flux Qubit & Phase Slip Clamping.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.cryogenic_flux_qubit.cryogenic_flux_qubit import (
    get_cryogenic_flux_qubit_service,
)

router = APIRouter(
    prefix="/api/cryogenic-flux-qubit",
    tags=["Capability 163: Cryogenic Flux Qubit"],
)


class ClampPhaseSlipRequest(BaseModel):
    qubit_id: str = Field(..., description="ID of the cryogenic flux qubit")
    magnetic_flux_bias_phi0: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="External magnetic flux bias in units of Phi_0",
    )
    microwave_attenuation_db: float = Field(
        default=60.0,
        ge=20.0,
        le=120.0,
        description="Cryogenic line microwave attenuation in dB",
    )
    pump_frequency_ghz: float = Field(
        default=6.45, ge=1.0, le=25.0, description="Resonator pump frequency in GHz"
    )
    superconducting_gain: float = Field(
        default=1.2, ge=0.5, le=3.0, description="Parametric amplifier gain multiplier"
    )


@router.get("/qubits")
async def list_cryogenic_flux_qubits():
    """List registered cryogenic flux qubits."""
    svc = get_cryogenic_flux_qubit_service()
    return {"qubits": svc.get_qubits()}


@router.post("/clamp-phase-slip")
async def clamp_cryogenic_phase_slip(request: ClampPhaseSlipRequest):
    """Clamp quantum phase slips and lock persistent current at sweet spot."""
    svc = get_cryogenic_flux_qubit_service()
    try:
        return svc.clamp_phase_slip(
            qubit_id=request.qubit_id,
            magnetic_flux_bias_phi0=request.magnetic_flux_bias_phi0,
            microwave_attenuation_db=request.microwave_attenuation_db,
            pump_frequency_ghz=request.pump_frequency_ghz,
            superconducting_gain=request.superconducting_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_cryogenic_flux_metrics():
    """Return aggregate telemetry metrics for cryogenic flux qubits."""
    svc = get_cryogenic_flux_qubit_service()
    return svc.get_metrics()
