"""
FastAPI Router for Capability 143: Hitchin Moduli Space & Hyperkahler Spectral-Network Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.hitchin_moduli_hyperkahler.hitchin_moduli_hyperkahler import (
    get_hitchin_moduli_firewall,
)

router = APIRouter(
    prefix="/api/hitchin-moduli-hyperkahler",
    tags=["Capability 143: Hitchin Moduli & Hyperkahler Firewall"],
)


class SealHitchinRequest(BaseModel):
    bundle_id: str = Field(..., description="ID of the Hitchin moduli bundle")
    riemann_genus: int = Field(
        default=3, ge=2, le=24, description="Base Riemann surface genus g"
    )
    spectral_network_nodes: int = Field(
        default=12, ge=4, le=128, description="GMN spectral network branch nodes"
    )
    twistor_rotation_deg: int = Field(
        default=18, ge=1, le=90, description="Hyperkahler P^1 twistor rotation angle"
    )
    hyperkahler_gain: float = Field(
        default=1.6, ge=0.85, le=2.5, description="Hyperkahler self-duality gain"
    )


@router.get("/bundles")
async def list_hitchin_bundles():
    """List registered Hitchin Higgs-bundle moduli topologies."""
    fw = get_hitchin_moduli_firewall()
    return {"bundles": fw.get_bundles()}


@router.post("/seal-hitchin")
async def seal_hitchin_bundle_route(request: SealHitchinRequest):
    """Verify Hitchin self-duality and lock GMN spectral network phases."""
    fw = get_hitchin_moduli_firewall()
    try:
        return fw.seal_hitchin_bundle(
            bundle_id=request.bundle_id,
            riemann_genus=request.riemann_genus,
            spectral_network_nodes=request.spectral_network_nodes,
            twistor_rotation_deg=request.twistor_rotation_deg,
            hyperkahler_gain=request.hyperkahler_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_hitchin_metrics():
    """Retrieve aggregate Hitchin Moduli & Hyperkahler Firewall metrics."""
    fw = get_hitchin_moduli_firewall()
    return fw.get_hitchin_metrics()
