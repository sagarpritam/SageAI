"""
FastAPI Router for Capability 129: Boundary CFT (BCFT) Defect Line & g-Theorem RG Interface Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.cft_defect_bcft.cft_defect_bcft import (
    get_cft_defect_bcft_shield,
)

router = APIRouter(
    prefix="/api/cft-defect-bcft",
    tags=["Capability 129: BCFT Defect Line & g-Theorem RG Interface Shield"],
)


class SealInterfaceRequest(BaseModel):
    interface_id: str = Field(..., description="ID of the BCFT defect interface")
    g_uv: float = Field(
        default=2.0,
        ge=1.0,
        le=16.0,
        description="Ultraviolet Affleck-Ludwig boundary degeneracy g_UV",
    )
    g_ir: float = Field(
        default=1.414,
        ge=0.5,
        le=16.0,
        description="Infrared Affleck-Ludwig boundary degeneracy g_IR",
    )
    transmission_coeff: float = Field(
        default=0.94,
        ge=0.0,
        le=1.0,
        description="Conformal defect energy transmission coefficient T",
    )
    cardy_clamp_gain: float = Field(
        default=1.5,
        ge=0.85,
        le=2.5,
        description="Cardy-Ishibashi boundary condition orthogonality gain",
    )


@router.get("/interfaces")
async def list_interfaces():
    """List all registered BCFT defect interfaces."""
    shield = get_cft_defect_bcft_shield()
    return {"interfaces": shield.get_interfaces()}


@router.post("/seal-interface")
async def seal_interface_route(request: SealInterfaceRequest):
    """Seal BCFT defect interface under g-theorem RG flow monotonicity."""
    shield = get_cft_defect_bcft_shield()
    try:
        return shield.seal_bcft_interface(
            interface_id=request.interface_id,
            g_uv=request.g_uv,
            g_ir=request.g_ir,
            transmission_coeff=request.transmission_coeff,
            cardy_clamp_gain=request.cardy_clamp_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_cft_defect_bcft_metrics():
    """Retrieve aggregate BCFT defect interface shield metrics."""
    shield = get_cft_defect_bcft_shield()
    return shield.get_cft_defect_bcft_metrics()
