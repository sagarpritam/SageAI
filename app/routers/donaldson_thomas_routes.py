"""
FastAPI Router for Capability 155: Donaldson-Thomas Invariant & Coherent Sheaf Moduli Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.donaldson_thomas_sheaf.donaldson_thomas_sheaf import (
    get_donaldson_thomas_sheaf_shield,
)

router = APIRouter(
    prefix="/api/donaldson-thomas-sheaf",
    tags=["Capability 155: Donaldson-Thomas Sheaf Shield"],
)


class SealDonaldsonThomasRequest(BaseModel):
    sheaf_id: str = Field(
        ..., description="ID of the DT coherent sheaf moduli configuration"
    )
    sheaf_rank: int = Field(
        default=3, ge=1, le=16, description="Coherent sheaf Mukai vector rank"
    )
    chern_degree: int = Field(
        default=6, ge=2, le=64, description="Chern character degree cutoff"
    )
    stability_chamber_depth: int = Field(
        default=8,
        ge=2,
        le=32,
        description="Bridgeland stability chamber wall-crossing depth",
    )
    dt_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Joyce-Song motivic Hall algebra gain multiplier",
    )


@router.get("/sheaves")
async def list_dt_sheaves():
    """List registered DT coherent sheaf moduli configurations."""
    sh = get_donaldson_thomas_sheaf_shield()
    return {"sheaves": sh.get_sheaves()}


@router.post("/seal-dt")
async def seal_dt_route(request: SealDonaldsonThomasRequest):
    """Seal Joyce-Song wall-crossing and lock motivic Hall algebra commutators."""
    sh = get_donaldson_thomas_sheaf_shield()
    try:
        return sh.seal_donaldson_thomas(
            sheaf_id=request.sheaf_id,
            sheaf_rank=request.sheaf_rank,
            chern_degree=request.chern_degree,
            stability_chamber_depth=request.stability_chamber_depth,
            dt_gain=request.dt_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_dt_metrics_route():
    """Return aggregate Donaldson-Thomas Sheaf Shield telemetry."""
    sh = get_donaldson_thomas_sheaf_shield()
    return sh.get_dt_metrics()
