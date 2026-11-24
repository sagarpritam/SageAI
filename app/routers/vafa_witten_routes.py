from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.finance.vafa_witten_dao import vafa_witten_service

router = APIRouter(
    prefix="/api/finance/vafa-witten-dao",
    tags=["Vafa-Witten S-Duality DAO"],
)


class StakeVafaWittenRequest(BaseModel):
    vault_id: str = Field(
        ..., description="Target Vafa-Witten S-Duality vault identifier"
    )
    stake_volume_quadrillion_usd: Optional[float] = Field(
        50.0, description="Volume of capital to stake in quadrillions USD"
    )


@router.get("/summary")
async def get_vafa_witten_summary():
    return vafa_witten_service.get_summary()


@router.get("/vaults")
async def list_vafa_witten_vaults():
    return vafa_witten_service.list_vaults()


@router.post("/stake")
async def stake_vafa_witten_capital(request: StakeVafaWittenRequest):
    return vafa_witten_service.stake_vafa_witten(
        vault_id=request.vault_id,
        stake_volume_quadrillion_usd=request.stake_volume_quadrillion_usd or 50.0,
    )
