"""
FastAPI Router for Capability 153: Derived Spectral Scheme & Artin Stack Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.derived_spectral_scheme.derived_spectral_scheme import (
    get_derived_spectral_scheme_firewall,
)

router = APIRouter(
    prefix="/api/derived-spectral-scheme",
    tags=["Capability 153: Derived Spectral Scheme & Artin Stack"],
)


class SealSpectralSchemeRequest(BaseModel):
    scheme_id: str = Field(..., description="ID of the derived spectral scheme")
    spectral_rank: int = Field(
        default=4, ge=2, le=16, description="E_infinity-ring spectral rank"
    )
    cotangent_truncation: int = Field(
        default=12, ge=4, le=64, description="Cotangent complex truncation order"
    )
    etale_sheaf_strata: int = Field(
        default=14, ge=4, le=128, description="Hypercomplete etale descent strata"
    )
    scheme_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Spectral obstruction gain multiplier",
    )


@router.get("/schemes")
async def list_spectral_schemes():
    """List registered Spectral Schemes and Derived Artin stacks."""
    fw = get_derived_spectral_scheme_firewall()
    return {"schemes": fw.get_schemes()}


@router.post("/seal-scheme")
async def seal_spectral_scheme_route(request: SealSpectralSchemeRequest):
    """Seal cotangent obstruction complex and lock hypercomplete etale descent."""
    fw = get_derived_spectral_scheme_firewall()
    try:
        return fw.seal_spectral_scheme(
            scheme_id=request.scheme_id,
            spectral_rank=request.spectral_rank,
            cotangent_truncation=request.cotangent_truncation,
            etale_sheaf_strata=request.etale_sheaf_strata,
            scheme_gain=request.scheme_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_spectral_scheme_metrics_route():
    """Return aggregate Derived Spectral Scheme Firewall telemetry."""
    fw = get_derived_spectral_scheme_firewall()
    return fw.get_scheme_metrics()
