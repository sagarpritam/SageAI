"""FastAPI Router for Capability 170: Langlands Automorphic Duality Engine."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.langlands_automorphic_shield.langlands_automorphic_shield import (
    get_langlands_automorphic_shield_service,
)

router = APIRouter(
    prefix="/api/langlands-automorphic",
    tags=["Capability 170: Langlands Automorphic Shield"],
)


class SynthesizeHeckeRequest(BaseModel):
    packet_id: str = Field(..., description="ID of the automorphic representation packet")
    prime_cutoff: int = Field(
        default=17, ge=2, le=23, description="Maximum prime p for Hecke eigenvalue synthesis"
    )
    ram_bound_tolerance: float = Field(
        default=1e-5, ge=1e-9, le=1e-2, description="Ramanujan-Petersson bound tolerance"
    )
    l_function_s: float = Field(
        default=1.0, ge=0.5, le=3.0, description="Complex evaluation argument s for L(s, pi)"
    )
    hecke_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Hecke spectral eigenform pinning gain"
    )


@router.get("/packets")
async def list_automorphic_packets():
    """List registered Langlands automorphic packets."""
    svc = get_langlands_automorphic_shield_service()
    return {"packets": svc.get_packets()}


@router.post("/synthesize-hecke")
async def synthesize_hecke_eigenvalues(request: SynthesizeHeckeRequest):
    """Synthesize Hecke eigenform packet and verify Ramanujan-Petersson bounds."""
    svc = get_langlands_automorphic_shield_service()
    try:
        return svc.synthesize_hecke(
            packet_id=request.packet_id,
            prime_cutoff=request.prime_cutoff,
            ram_bound_tolerance=request.ram_bound_tolerance,
            l_function_s=request.l_function_s,
            hecke_gain=request.hecke_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_langlands_metrics():
    """Return operational metrics for Langlands automorphic shield."""
    svc = get_langlands_automorphic_shield_service()
    return svc.get_metrics()
