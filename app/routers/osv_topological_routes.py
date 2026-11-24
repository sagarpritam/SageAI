from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.finance.osv_topological_dao import osv_topological_service

router = APIRouter(
    prefix="/api/finance/osv-topological-dao",
    tags=["OSV Topological String DAO"],
)


class StakeOSVRequest(BaseModel):
    vault_id: str = Field(
        ..., description="Target OSV Topological String vault identifier"
    )
    stake_volume_quadrillion_usd: Optional[float] = Field(
        50.0, description="Volume of capital to stake in quadrillions USD"
    )


@router.get("/summary")
async def get_osv_summary():
    return osv_topological_service.get_summary()


@router.get("/vaults")
async def list_osv_vaults():
    return osv_topological_service.list_vaults()


@router.post("/stake")
async def stake_osv_capital(request: StakeOSVRequest):
    return osv_topological_service.stake_osv(
        vault_id=request.vault_id,
        stake_volume_quadrillion_usd=request.stake_volume_quadrillion_usd or 50.0,
    )
