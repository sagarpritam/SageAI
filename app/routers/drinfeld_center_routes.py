from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.finance.drinfeld_center_dao import drinfeld_center_service

router = APIRouter(
    prefix="/api/finance/drinfeld-center-dao",
    tags=["Drinfeld Center Modular Tensor Category DAO"],
)


class StakeCapitalRequest(BaseModel):
    vault_id: str = Field(
        ..., description="Target Drinfeld center category vault identifier"
    )
    stake_amount_quadrillion_usd: Optional[float] = Field(
        50.0, description="Capital volume to stake in quadrillion USD"
    )


@router.get("/summary")
async def get_dao_summary():
    return drinfeld_center_service.get_summary()


@router.get("/vaults")
async def list_dao_vaults():
    return drinfeld_center_service.get_vaults()


@router.post("/stake")
async def stake_capital_vault(request: StakeCapitalRequest):
    return drinfeld_center_service.stake_capital(
        vault_id=request.vault_id,
        stake_amount_quadrillion_usd=request.stake_amount_quadrillion_usd
        if request.stake_amount_quadrillion_usd is not None
        else 50.0,
    )
