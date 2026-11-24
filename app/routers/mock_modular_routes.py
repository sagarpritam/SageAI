from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.finance.mock_modular_dao import mock_modular_service

router = APIRouter(
    prefix="/api/finance/mock-modular-dao",
    tags=["Mock Modular Form DAO"],
)


class StakeMockModularRequest(BaseModel):
    vault_id: str = Field(..., description="Target Mock Modular yield vault identifier")
    stake_volume_quadrillion_usd: Optional[float] = Field(
        50.0, description="Volume of capital to stake in quadrillions USD"
    )


@router.get("/summary")
async def get_mock_modular_summary():
    return mock_modular_service.get_summary()


@router.get("/vaults")
async def list_mock_modular_vaults():
    return mock_modular_service.list_vaults()


@router.post("/stake")
async def stake_mock_modular_capital(request: StakeMockModularRequest):
    return mock_modular_service.stake_mock_modular(
        vault_id=request.vault_id,
        stake_volume_quadrillion_usd=request.stake_volume_quadrillion_usd or 50.0,
    )
