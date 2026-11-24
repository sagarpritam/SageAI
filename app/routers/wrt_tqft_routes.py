from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.finance.wrt_tqft_quantum_dao import wrt_tqft_service

router = APIRouter(
    prefix="/api/finance/wrt-tqft-quantum-dao",
    tags=["Witten-Reshetikhin-Turaev 3D TQFT Quantum Invariant Yield DAO"],
)


class StakeWrtRequest(BaseModel):
    vault_id: str = Field(
        ..., description="Target WRT 3D TQFT invariant vault identifier"
    )
    stake_amount_quadrillion_usd: Optional[float] = Field(
        50.0, description="Capital volume to stake in quadrillion USD"
    )


@router.get("/summary")
async def get_wrt_summary():
    return wrt_tqft_service.get_summary()


@router.get("/vaults")
async def list_wrt_vaults():
    return wrt_tqft_service.get_vaults()


@router.post("/stake")
async def stake_wrt_vault(request: StakeWrtRequest):
    return wrt_tqft_service.stake_wrt(
        vault_id=request.vault_id,
        stake_amount_quadrillion_usd=request.stake_amount_quadrillion_usd
        if request.stake_amount_quadrillion_usd is not None
        else 50.0,
    )
