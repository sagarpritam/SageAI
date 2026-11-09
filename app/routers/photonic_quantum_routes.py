"""
FastAPI Router for Photonic Optical Quantum Computing Cryptanalytic Co-Processor & Lattice Decryption Firewall.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.photonic_quantum.photonic_quantum_firewall import (
    photonic_quantum_firewall,
)

router = APIRouter(
    prefix="/photonic-quantum",
    tags=["Photonic Quantum Computing Co-Processor & Lattice Decryption Firewall"],
)


class EvaluateLatticeCryptanalysisRequest(BaseModel):
    coprocessor_id: str = Field(..., description="Target photonic quantum co-processor ID")
    lattice_dimension: int = Field(1024, description="Lattice dimension n (e.g. 512, 768, 1024)")
    target_pqc_scheme: str = Field("ML-KEM-1024", description="Target post-quantum cryptographic scheme")
    root_hermite_factor: float = Field(1.0045, description="Root Hermite factor delta")
    photon_loss_rate_pct: float = Field(1.2, description="Optical waveguide photon loss rate percentage")


class EngagePhotonicFirewallRequest(BaseModel):
    coprocessor_id: str = Field(..., description="Photonic co-processor to shield")
    defense_mode: str = Field("OPTICAL_NOISE_INJECTION_BARRIER", description="Phase scrambling barrier mode")


@router.get("/coprocessors")
@limiter.limit("60/minute")
async def list_coprocessors_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored photonic quantum cryptanalytic co-processors."""
    return {"status": "success", "coprocessors": photonic_quantum_firewall.list_coprocessors()}


@router.get("/coprocessors/{coprocessor_id}")
@limiter.limit("60/minute")
async def get_coprocessor_endpoint(
    request: Request,
    coprocessor_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific photonic quantum co-processor."""
    coprocessor = photonic_quantum_firewall.get_coprocessor(coprocessor_id)
    if not coprocessor:
        raise HTTPException(status_code=404, detail="Photonic quantum co-processor not found")
    return {"status": "success", "coprocessor": coprocessor}


@router.post("/evaluate-lattice")
@limiter.limit("60/minute")
async def evaluate_lattice_endpoint(
    request: Request,
    body: EvaluateLatticeCryptanalysisRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Evaluates optical quantum cryptanalysis against post-quantum lattice encryption."""
    try:
        verdict = photonic_quantum_firewall.evaluate_lattice_cryptanalysis(
            coprocessor_id=body.coprocessor_id,
            lattice_dimension=body.lattice_dimension,
            target_pqc_scheme=body.target_pqc_scheme,
            root_hermite_factor=body.root_hermite_factor,
            photon_loss_rate_pct=body.photon_loss_rate_pct,
        )
        return {"status": "success", "evaluation": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/engage-firewall")
@limiter.limit("30/minute")
async def engage_firewall_endpoint(
    request: Request,
    body: EngagePhotonicFirewallRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Discharges sub-picosecond optical noise injection destroying adversarial quantum coherence."""
    try:
        result = photonic_quantum_firewall.engage_photonic_firewall(
            coprocessor_id=body.coprocessor_id,
            defense_mode=body.defense_mode,
        )
        return {"status": "success", "firewall_event": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_photonic_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns fleet telemetry for photonic optical quantum firewall defense."""
    return {"status": "success", "metrics": photonic_quantum_firewall.get_photonic_metrics()}

