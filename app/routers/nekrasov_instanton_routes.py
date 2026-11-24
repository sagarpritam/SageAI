from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.finance.nekrasov_instanton_dao import nekrasov_instanton_service

router = APIRouter(
    prefix="/api/finance/nekrasov-instanton-dao",
    tags=["Nekrasov Instanton DAO"],
)


class StakeNekrasovRequest(BaseModel):
    vault_id: str = Field(..., description="Target Nekrasov instanton vault identifier")
    stake_volume_quadrillion_usd: Optional[float] = Field(
        50.0, description="Volume of capital to stake in quadrillions USD"
    )


@router.get("/summary")
async def get_nekrasov_summary():
    return nekrasov_instanton_service.get_summary()


@router.get("/vaults")
async def list_nekrasov_vaults():
    return nekrasov_instanton_service.list_vaults()


@router.post("/stake")
async def stake_nekrasov_capital(request: StakeNekrasovRequest):
    return nekrasov_instanton_service.stake_nekrasov(
        vault_id=request.vault_id,
        stake_volume_quadrillion_usd=request.stake_volume_quadrillion_usd or 50.0,
    )
