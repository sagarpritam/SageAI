"""
FastAPI Router for Capability 137: Grothendieck Topos Site Sheaf & Logic-Classifier Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.topos_grothendieck_firewall.topos_grothendieck_firewall import (
    get_topos_grothendieck_firewall,
)

router = APIRouter(
    prefix="/api/topos-grothendieck-firewall",
    tags=["Capability 137: Grothendieck Topos Site Sheaf Firewall"],
)


class SealToposSheafRequest(BaseModel):
    site_id: str = Field(..., description="ID of the Grothendieck topos sheaf site")
    sheaf_dimension: int = Field(
        default=8, ge=2, le=64, description="Dimension of the Etale sheaf stalk"
    )
    cech_cover_rank: int = Field(
        default=12, ge=4, le=128, description="Cech open covering nerve rank"
    )
    omega_classifier_depth: int = Field(
        default=6,
        ge=2,
        le=32,
        description="Lawvere-Tierney subobject classifier Omega depth",
    )
    topos_gain: float = Field(
        default=1.5, ge=0.85, le=2.5, description="Sheaf descent gluing gain"
    )


@router.get("/sites")
async def list_topos_sites():
    """List registered Grothendieck topos sheaf sites."""
    fw = get_topos_grothendieck_firewall()
    return {"sites": fw.get_sites()}


@router.post("/seal-sheaf")
async def seal_sheaf_route(request: SealToposSheafRequest):
    """Verify Cech gluing and seal Lawvere-Tierney subobject classifier sheaves."""
    fw = get_topos_grothendieck_firewall()
    try:
        return fw.seal_topos_sheaf(
            site_id=request.site_id,
            sheaf_dimension=request.sheaf_dimension,
            cech_cover_rank=request.cech_cover_rank,
            omega_classifier_depth=request.omega_classifier_depth,
            topos_gain=request.topos_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_topos_metrics():
    """Retrieve aggregate Grothendieck Topos Site Sheaf Firewall metrics."""
    fw = get_topos_grothendieck_firewall()
    return fw.get_topos_metrics()
