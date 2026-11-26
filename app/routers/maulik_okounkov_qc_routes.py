from fastapi import APIRouter
from pydantic import BaseModel
from app.services.maulik_okounkov_quantum_cohomology_shield import (
    get_maulik_okounkov_quantum_cohomology_shield_service,
)

router = APIRouter(prefix="/api/maulik-okounkov-qc", tags=["Wave 72 Maulik-Okounkov QC"])


class QuantumCohomologyRequest(BaseModel):
    cohomology_id: str = "MAULIK-OKOUNKOV-QC-01"
    torus_rank: int = 4
    quantum_degree: int = 3
    shield_gain: float = 1.25


@router.get("/cohomologies")
async def list_cohomologies():
    return get_maulik_okounkov_quantum_cohomology_shield_service().list_cohomologies()


@router.post("/evaluate-quantum-cohomology")
async def evaluate_quantum_cohomology(req: QuantumCohomologyRequest):
    return get_maulik_okounkov_quantum_cohomology_shield_service().evaluate_quantum_cohomology(
        cohomology_id=req.cohomology_id,
        torus_rank=req.torus_rank,
        quantum_degree=req.quantum_degree,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_maulik_okounkov_quantum_cohomology_shield_service().get_metrics()
