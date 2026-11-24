from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.finance.sen_entropy_dao import sen_entropy_service

router = APIRouter(
    prefix="/api/finance/sen-entropy-dao",
    tags=["Sen Entropy Function DAO"],
)


class StakeEntropyRequest(BaseModel):
    vault_id: str = Field(..., description="Target Sen entropy vault identifier")
    stake_volume_quadrillion_usd: Optional[float] = Field(
        50.0, description="Volume of capital to stake in quadrillions USD"
    )


@router.get("/summary")
async def get_entropy_summary():
    return sen_entropy_service.get_summary()


@router.get("/vaults")
async def list_entropy_vaults():
    return sen_entropy_service.list_vaults()


@router.post("/stake")
async def stake_entropy_capital(request: StakeEntropyRequest):
    return sen_entropy_service.stake_entropy(
        vault_id=request.vault_id,
        stake_volume_quadrillion_usd=request.stake_volume_quadrillion_usd or 50.0,
    )
