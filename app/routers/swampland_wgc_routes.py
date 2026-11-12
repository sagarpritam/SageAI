"""
FastAPI Router for Capability 119: Swampland Distance Conjecture & Weak Gravity EFT Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.swampland_wgc.swampland_wgc import get_swampland_wgc_firewall

router = APIRouter(
    prefix="/api/swampland-wgc",
    tags=["Capability 119: Swampland Distance & Weak Gravity EFT Firewall"],
)


class AuditEFTRequest(BaseModel):
    bound_id: str = Field(..., description="ID of the Swampland / WGC bound regime")
    field_excursion_mpl: float = Field(
        default=2.0,
        ge=0.1,
        le=8.0,
        description="Geodesic moduli excursion Delta Phi in Planck units",
    )
    alpha_exponent: float = Field(
        default=0.707,
        ge=0.3,
        le=1.5,
        description="Exponential Swampland tower descent coefficient alpha",
    )
    charge_mass_ratio: float = Field(
        default=1.25,
        ge=1.0,
        le=4.0,
        description="Sublattice Weak Gravity charge-to-mass extremity ratio z",
    )
    species_cutoff_gain: float = Field(
        default=1.4,
        ge=0.85,
        le=2.5,
        description="Species scale Lambda_sp UV cutoff reinforcement gain",
    )


@router.get("/bounds")
async def list_bounds():
    """List all registered Swampland Distance & WGC EFT firewall regimes."""
    fw = get_swampland_wgc_firewall()
    return {"bounds": fw.get_bounds()}


@router.post("/audit-eft")
async def audit_eft_route(request: AuditEFTRequest):
    """Audit EFT operator against Swampland Distance Conjecture & Sublattice WGC bounds."""
    fw = get_swampland_wgc_firewall()
    try:
        return fw.audit_eft_uv_completion(
            bound_id=request.bound_id,
            field_excursion_mpl=request.field_excursion_mpl,
            alpha_exponent=request.alpha_exponent,
            charge_mass_ratio=request.charge_mass_ratio,
            species_cutoff_gain=request.species_cutoff_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_swampland_metrics():
    """Retrieve aggregate Swampland & WGC firewall metrics."""
    fw = get_swampland_wgc_firewall()
    return fw.get_swampland_metrics()
