"""
FastAPI Router for Option B Wave 48: Sovereign Planetary Room-Temperature LK-99 & Hydride Megabar Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.hydride_megabar_supergrid.hydride_megabar_supergrid import (
    get_hydride_megabar_supergrid_service,
)

router = APIRouter(
    prefix="/api/hydride-megabar-supergrid",
    tags=["Option B Wave 48: Hydride Megabar Supergrid"],
)


class HarvestMegabarRequest(BaseModel):
    vault_id: str = Field(..., description="ID of the hydride megabar power vault")
    megabar_pressure_gpa: float = Field(
        default=175.0,
        ge=0.1,
        le=500.0,
        description="Chamber pressure in GPa (megabars)",
    )
    phonon_coupling_alpha2f: float = Field(
        default=2.4,
        ge=0.5,
        le=10.0,
        description="Eliashberg electron-phonon coupling constant",
    )
    rectification_gain: float = Field(
        default=1.2,
        ge=0.5,
        le=3.0,
        description="High-pressure DC rectification gain multiplier",
    )


@router.get("/vaults")
async def list_hydride_vaults():
    """List registered hydride megabar power vaults."""
    svc = get_hydride_megabar_supergrid_service()
    return {"vaults": svc.get_vaults()}


@router.post("/harvest-megabar")
async def harvest_hydride_megabar(request: HarvestMegabarRequest):
    """Harvest clean superconducting electrical power from high-pressure hydride supergrid."""
    svc = get_hydride_megabar_supergrid_service()
    try:
        return svc.harvest_megabar(
            vault_id=request.vault_id,
            megabar_pressure_gpa=request.megabar_pressure_gpa,
            phonon_coupling_alpha2f=request.phonon_coupling_alpha2f,
            rectification_gain=request.rectification_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_hydride_megabar_metrics():
    """Return aggregate telemetry metrics for hydride megabar supergrid."""
    svc = get_hydride_megabar_supergrid_service()
    return svc.get_metrics()
