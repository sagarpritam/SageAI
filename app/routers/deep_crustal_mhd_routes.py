from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.deep_crustal_mhd_vault import deep_crustal_mhd_vault

router = APIRouter(
    prefix="/api/deep-crustal-mhd",
    tags=["Sovereign Subterranean Deep-Crustal MHD Geothermal Vault (Option B)"],
)


class GenerateMHDPowerRequest(BaseModel):
    vault_id: str = Field(..., description="Target deep-crustal vault ID")
    brine_velocity_factor: float = Field(default=1.0, ge=0.1, le=5.0, description="Brine velocity flow factor")
    load_factor: float = Field(default=0.85, ge=0.1, le=1.0, description="MHD generator electrical load factor")


@router.get("/vaults")
async def get_vaults() -> List[Dict[str, Any]]:
    return deep_crustal_mhd_vault.list_vaults()


@router.post("/generate-power")
async def generate_power(req: GenerateMHDPowerRequest) -> Dict[str, Any]:
    try:
        return deep_crustal_mhd_vault.generate_mhd_baseload(
            vault_id=req.vault_id,
            brine_velocity_factor=req.brine_velocity_factor,
            load_factor=req.load_factor,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return deep_crustal_mhd_vault.get_vault_metrics()

