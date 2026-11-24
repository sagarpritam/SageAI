from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.finance.grothendieck_serre_dao import grothendieck_serre_service

router = APIRouter(
    prefix="/api/finance/grothendieck-serre-dao",
    tags=["Grothendieck-Serre Principal Bundle Torsor Arbitrage DAO"],
)


class StakeTorsorRequest(BaseModel):
    vault_id: str = Field(
        ..., description="Target Grothendieck-Serre torsor vault identifier"
    )
    stake_volume_quadrillion_usd: Optional[float] = Field(
        50.0, description="Capital allocation volume in Quadrillion USD"
    )


@router.get("/summary")
async def get_torsor_summary():
    return grothendieck_serre_service.get_summary()


@router.get("/vaults")
async def list_torsor_vaults():
    return grothendieck_serre_service.list_vaults()


@router.post("/stake")
async def stake_torsor_capital(request: StakeTorsorRequest):
    return grothendieck_serre_service.stake_torsor_capital(
        vault_id=request.vault_id,
        stake_volume_quadrillion_usd=request.stake_volume_quadrillion_usd
        if request.stake_volume_quadrillion_usd is not None
        else 50.0,
    )
