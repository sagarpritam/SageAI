from fastapi import APIRouter
from pydantic import BaseModel
from app.services.lusztig_canonical_basis_shield import (
    get_lusztig_canonical_basis_shield_service,
)

router = APIRouter(prefix="/api/lusztig-canonical-basis", tags=["Wave 76 Lusztig Canonical Basis"])


class CanonicalBasisRequest(BaseModel):
    basis_id: str = "LUSZTIG-CANONICAL-UQG-01"
    crystal_rank: int = 4
    bar_order: int = 2
    shield_gain: float = 1.25


@router.get("/bases")
async def list_bases():
    return get_lusztig_canonical_basis_shield_service().list_bases()


@router.post("/evaluate-canonical-basis")
async def evaluate_canonical_basis(req: CanonicalBasisRequest):
    return get_lusztig_canonical_basis_shield_service().evaluate_canonical_basis(
        basis_id=req.basis_id,
        crystal_rank=req.crystal_rank,
        bar_order=req.bar_order,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_lusztig_canonical_basis_shield_service().get_metrics()
