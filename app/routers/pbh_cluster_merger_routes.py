from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.pbh_cluster_merger_dao import pbh_cluster_merger_service

router = APIRouter(
    prefix="/api/finance/pbh-cluster-merger", tags=["PBH Cluster Merger DAO"]
)


class StakeMergerRequest(BaseModel):
    vault_id: str = "QCD-PHASE-SUB-SOLAR"
    stake_volume_quadrillion_usd: Optional[float] = 40.0


@router.get("/summary")
def get_summary() -> Dict[str, Any]:
    return pbh_cluster_merger_service.get_summary()


@router.get("/vaults")
def get_vaults() -> List[Dict[str, Any]]:
    return pbh_cluster_merger_service.get_vaults()


@router.post("/stake")
def stake_merger_capital(req: StakeMergerRequest) -> Dict[str, Any]:
    return pbh_cluster_merger_service.stake_capital(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd or 40.0,
    )
