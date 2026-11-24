"""FastAPI Router for Wave 50 Option B: Planetary Gravitational-Wave Resonant Phonon Lattice."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.gravitational_phonon_lattice.gravitational_phonon_lattice import (
    get_gravitational_phonon_lattice_service,
)

router = APIRouter(
    prefix="/api/gravitational-phonon",
    tags=["Wave 50 Option B: Gravitational Phonon Lattice"],
)


class HarvestPhononsRequest(BaseModel):
    lattice_id: str = Field(..., description="ID of the gravitational phonon lattice")
    strain_amplitude_h: float = Field(
        default=1e-22, ge=1e-25, le=1e-20, description="Gravitational wave metric strain amplitude h"
    )
    acoustic_coupling: float = Field(
        default=0.88, ge=0.1, le=1.0, description="Acoustic resonator coupling factor"
    )
    piezo_efficiency: float = Field(
        default=0.94, ge=0.5, le=1.0, description="Piezoelectric electromechanical conversion efficiency"
    )
    extraction_duration_s: float = Field(
        default=60.0, ge=1.0, le=3600.0, description="Energy extraction duration in seconds"
    )


@router.get("/lattices")
async def list_phonon_lattices():
    """List registered planetary gravitational phonon lattices."""
    svc = get_gravitational_phonon_lattice_service()
    return {"lattices": svc.get_lattices()}


@router.post("/harvest-phonons")
async def harvest_gravitational_phonons(request: HarvestPhononsRequest):
    """Harvest continuous power via parametric gravitational-wave phonon coupling."""
    svc = get_gravitational_phonon_lattice_service()
    try:
        return svc.harvest_phonons(
            lattice_id=request.lattice_id,
            strain_amplitude_h=request.strain_amplitude_h,
            acoustic_coupling=request.acoustic_coupling,
            piezo_efficiency=request.piezo_efficiency,
            extraction_duration_s=request.extraction_duration_s,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_phonon_metrics():
    """Return operational metrics for gravitational phonon lattice."""
    svc = get_gravitational_phonon_lattice_service()
    return svc.get_metrics()
