from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gaitsgory_rozenblyum_dg_indcoherent_firewall import (
    get_gaitsgory_rozenblyum_dg_indcoherent_firewall_service,
)

router = APIRouter(prefix="/api/gaitsgory-rozenblyum-dag", tags=["Wave 73 Gaitsgory-Rozenblyum DAG"])


class IndcoherentCrystalRequest(BaseModel):
    crystal_id: str = "GAITSGORY-ROZENBLYUM-INDCOH-01"
    serre_order: int = 3
    algebroid_rank: int = 4
    firewall_gain: float = 1.25


@router.get("/crystals")
async def list_crystals():
    return get_gaitsgory_rozenblyum_dg_indcoherent_firewall_service().list_crystals()


@router.post("/evaluate-indcoherent-crystal")
async def evaluate_indcoherent_crystal(req: IndcoherentCrystalRequest):
    return get_gaitsgory_rozenblyum_dg_indcoherent_firewall_service().evaluate_indcoherent_crystal(
        crystal_id=req.crystal_id,
        serre_order=req.serre_order,
        algebroid_rank=req.algebroid_rank,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_gaitsgory_rozenblyum_dg_indcoherent_firewall_service().get_metrics()
