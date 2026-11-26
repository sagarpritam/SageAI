from fastapi import APIRouter
from pydantic import BaseModel
from app.services.milnor_bloch_kato_k_theory_firewall import (
    get_milnor_bloch_kato_k_theory_firewall_service,
)

router = APIRouter(prefix="/api/milnor-norm-residue", tags=["Wave 69 Milnor K-Theory"])


class MilnorSymbolRequest(BaseModel):
    symbol_id: str = "MILNOR-K2-SYMBOL-01"
    k_degree_n: int = 2
    torsion_m: int = 5
    firewall_gain: float = 1.25


@router.get("/symbols")
async def list_symbols():
    return get_milnor_bloch_kato_k_theory_firewall_service().list_symbols()


@router.post("/evaluate-milnor-symbol")
async def evaluate_milnor_symbol(req: MilnorSymbolRequest):
    return get_milnor_bloch_kato_k_theory_firewall_service().evaluate_milnor_symbol(
        symbol_id=req.symbol_id,
        k_degree_n=req.k_degree_n,
        torsion_m=req.torsion_m,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_milnor_bloch_kato_k_theory_firewall_service().get_metrics()
