from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rouquier_chuang_derived_equivalence_firewall import (
    get_rouquier_chuang_derived_equivalence_firewall_service,
)

router = APIRouter(prefix="/api/chuang-rouquier-sl2", tags=["Wave 75 Chuang-Rouquier sl2"])


class RickardComplexRequest(BaseModel):
    complex_id: str = "CHUANG-ROUQUIER-SL2-01"
    rickard_terms: int = 4
    perverse_shift_p: int = 2
    firewall_gain: float = 1.25


@router.get("/complexes")
async def list_complexes():
    return get_rouquier_chuang_derived_equivalence_firewall_service().list_complexes()


@router.post("/evaluate-rickard-complex")
async def evaluate_rickard_complex(req: RickardComplexRequest):
    return get_rouquier_chuang_derived_equivalence_firewall_service().evaluate_rickard_complex(
        complex_id=req.complex_id,
        rickard_terms=req.rickard_terms,
        perverse_shift_p=req.perverse_shift_p,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_rouquier_chuang_derived_equivalence_firewall_service().get_metrics()
