"""
FastAPI Router for Capability 102: Spin-Foam Quantum Geometry Area-Spectra Quantizer.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.services.spin_foam_quantizer.spin_foam_quantizer import get_spin_foam_geometry_quantizer

router = APIRouter(prefix="/api/spin-foam", tags=["Capability 102: Spin-Foam Quantizer"])


class QuantizeAreaRequest(BaseModel):
    simplex_id: str = Field(..., description="ID of the spin-foam simplex complex")
    spin_j: float = Field(default=1.5, ge=0.5, le=10.0, description="SU(2) spin representation j (half-integer or integer)")
    immirzi_gamma: float = Field(default=0.2375, ge=0.05, le=1.0, description="Barbero-Immirzi parameter")
    amplitude_gain: float = Field(default=1.0, ge=0.5, le=3.0, description="Amplitude normalization gain")


@router.get("/simplices")
async def list_simplices():
    """List all registered spin-foam complexes."""
    quantizer = get_spin_foam_geometry_quantizer()
    return {"simplices": quantizer.get_simplices()}


@router.post("/quantize-area")
async def quantize_area_route(request: QuantizeAreaRequest):
    """Quantize spatial area spectra via EPRL-FK 4-simplex spin-foam model."""
    quantizer = get_spin_foam_geometry_quantizer()
    try:
        telemetry = quantizer.quantize_area_spectra(
            simplex_id=request.simplex_id,
            spin_j=request.spin_j,
            immirzi_gamma=request.immirzi_gamma,
            amplitude_gain=request.amplitude_gain,
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_spin_foam_metrics():
    """Retrieve aggregate spin-foam quantum geometry metrics."""
    quantizer = get_spin_foam_geometry_quantizer()
    return quantizer.get_spin_foam_metrics()

