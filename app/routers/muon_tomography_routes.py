from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.muon_tomography import subsurface_muon_tomography

router = APIRouter(prefix="/api/muon-tomography", tags=["Subsurface Muon Tomography (Cap 75)"])


class TomographicScanRequest(BaseModel):
    station_id: str = Field(..., example="MUON-TEL-ALPS-GRANITE")
    target_zone: str = Field(..., example="Mont Blanc Deep Shaft Adit-4")
    target_depth_meters: float = Field(default=450.0, ge=10.0, le=2500.0)
    exposure_time_hours: float = Field(default=12.0, ge=0.5, le=168.0)


@router.get("/stations")
async def get_stations() -> List[Dict[str, Any]]:
    return subsurface_muon_tomography.list_stations()


@router.post("/execute-scan")
async def execute_scan(req: TomographicScanRequest) -> Dict[str, Any]:
    try:
        return subsurface_muon_tomography.execute_tomographic_inversion(
            station_id=req.station_id,
            target_zone=req.target_zone,
            target_depth_meters=req.target_depth_meters,
            exposure_time_hours=req.exposure_time_hours,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return subsurface_muon_tomography.get_mesh_metrics()
