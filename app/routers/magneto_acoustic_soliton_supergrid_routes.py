"""FastAPI Router for Wave 51 Option B: Planetary Magneto-Acoustic Soliton Core-Mantle Supergrid."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.magneto_acoustic_soliton_supergrid.magneto_acoustic_soliton_supergrid import (
    get_magneto_acoustic_soliton_supergrid_service,
)

router = APIRouter(
    prefix="/api/magneto-acoustic-soliton-supergrid",
    tags=["Wave 51 Option B: Magneto-Acoustic Soliton Supergrid"],
)


class HarvestSolitonsRequest(BaseModel):
    cavity_id: str = Field(..., description="ID of the magneto-acoustic soliton cavity")
    magnetic_field_tesla: float = Field(
        default=0.005, ge=0.001, le=0.05, description="Core-mantle boundary magnetic induction in Tesla"
    )
    acoustic_velocity_km_s: float = Field(
        default=13.6, ge=5.0, le=25.0, description="D'' layer magneto-acoustic speed in km/s"
    )
    piezo_efficiency: float = Field(
        default=0.95, ge=0.5, le=1.0, description="Piezoelectric electromechanical transduction efficiency"
    )
    extraction_duration_s: float = Field(
        default=60.0, ge=1.0, le=3600.0, description="Soliton energy extraction duration in seconds"
    )


@router.get("/cavities")
async def list_soliton_cavities():
    """List registered magneto-acoustic soliton cavities."""
    svc = get_magneto_acoustic_soliton_supergrid_service()
    return {"cavities": svc.get_cavities()}


@router.post("/harvest-solitons")
async def harvest_magneto_acoustic_solitons(request: HarvestSolitonsRequest):
    """Harvest continuous power from CMB magneto-acoustic solitary waves."""
    svc = get_magneto_acoustic_soliton_supergrid_service()
    try:
        return svc.harvest_solitons(
            cavity_id=request.cavity_id,
            magnetic_field_tesla=request.magnetic_field_tesla,
            acoustic_velocity_km_s=request.acoustic_velocity_km_s,
            piezo_efficiency=request.piezo_efficiency,
            extraction_duration_s=request.extraction_duration_s,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_soliton_metrics():
    """Return operational metrics for magneto-acoustic soliton supergrid."""
    svc = get_magneto_acoustic_soliton_supergrid_service()
    return svc.get_metrics()
