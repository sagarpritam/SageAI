from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.hyperspectral_interceptor import hyperspectral_interceptor_swarm

router = APIRouter(
    prefix="/api/hyperspectral-interceptor",
    tags=["Planetary Hyperspectral Interceptor Swarm (Option B)"],
)


class ScanTargetRegionRequest(BaseModel):
    satellite_id: str = Field(..., description="Target hyperspectral satellite ID")
    target_coordinates: str = Field(default="34.0522°N, 51.4215°E (Natanz Complex)", description="Target coordinates")
    suspected_classification: str = Field(default="COVERT_NUCLEAR_ENRICHMENT", description="Target classification")


class EngageTargetRequest(BaseModel):
    scan_id: str = Field(..., description="Scan event ID")
    interceptor_platform: str = Field(default="SPACE_GROUND_KINETIC_ROD", description="Interceptor platform type")


@router.get("/constellation")
async def get_constellation() -> List[Dict[str, Any]]:
    return hyperspectral_interceptor_swarm.list_satellites()


@router.post("/scan-target")
async def scan_target(req: ScanTargetRegionRequest) -> Dict[str, Any]:
    try:
        return hyperspectral_interceptor_swarm.scan_target_region(
            satellite_id=req.satellite_id,
            target_coordinates=req.target_coordinates,
            suspected_classification=req.suspected_classification,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/engage-target")
async def engage_target(req: EngageTargetRequest) -> Dict[str, Any]:
    try:
        return hyperspectral_interceptor_swarm.engage_target(
            scan_id=req.scan_id,
            interceptor_platform=req.interceptor_platform,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return hyperspectral_interceptor_swarm.get_swarm_metrics()
