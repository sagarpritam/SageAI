from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.cosmic_inflation_tensor_dao import (
    cosmic_inflation_tensor_service,
)

router = APIRouter(
    prefix="/api/finance/cosmic-inflation-tensor",
    tags=["Cosmic Inflation Tensor Mode DAO"],
)


class StakeTensorRequest(BaseModel):
    vault_id: str = "CITM-VAULT-PRIMORDIAL-INFLATON"
    stake_volume_quadrillion_usd: Optional[float] = 25.0


@router.get("/summary")
def get_summary() -> Dict[str, Any]:
    return cosmic_inflation_tensor_service.get_summary()


@router.get("/vaults")
def get_vaults() -> List[Dict[str, Any]]:
    return cosmic_inflation_tensor_service.get_vaults()


@router.post("/stake")
def stake(req: StakeTensorRequest) -> Dict[str, Any]:
    return cosmic_inflation_tensor_service.stake(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd or 25.0,
    )
