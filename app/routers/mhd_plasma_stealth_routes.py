from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.mhd_plasma_stealth import get_mhd_plasma_stealth

router = APIRouter(
    prefix="/api/mhd-plasma-stealth",
    tags=["Sovereign Sub-Atmospheric MHD Aerodynamic Plasma Stealth & Wave-Rider Shield (Option B)"],
)


class EngageStealthRequest(BaseModel):
    platform_id: str = Field(..., description="Target hypersonic aero platform ID")
    field_boost_tesla: float = Field(default=0.5, ge=0.0, le=2.0, description="Superconducting Halbach magnetic boost in Tesla")
    plasma_freq_ghz: float = Field(default=24.5, ge=1.0, le=100.0, description="Excitation plasma frequency in GHz")


@router.get("/platforms")
async def get_platforms() -> List[Dict[str, Any]]:
    mhd = get_mhd_plasma_stealth()
    return mhd.list_aero_platforms()


@router.post("/engage-stealth")
async def engage_stealth(req: EngageStealthRequest) -> Dict[str, Any]:
    try:
        mhd = get_mhd_plasma_stealth()
        return mhd.engage_plasma_stealth(
            platform_id=req.platform_id,
            field_boost_tesla=req.field_boost_tesla,
            plasma_freq_ghz=req.plasma_freq_ghz,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    mhd = get_mhd_plasma_stealth()
    return mhd.get_stealth_metrics()
