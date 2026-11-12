"""
FastAPI Router for Capability 150: Quantum Affine Algebra & Yangian R-Matrix Spectral Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.kashiwara_quantum_affine_yangian.kashiwara_quantum_affine_yangian import (
    get_quantum_affine_yangian_shield,
)

router = APIRouter(
    prefix="/api/kashiwara-quantum-affine-yangian",
    tags=["Capability 150: Quantum Affine Algebra & Yangian R-Matrix"],
)


class SealYangianRequest(BaseModel):
    yangian_id: str = Field(..., description="ID of the Quantum Affine Yangian")
    yangian_rank: int = Field(
        default=4, ge=2, le=16, description="Yangian algebra Lie rank"
    )
    bethe_roots_count: int = Field(
        default=16, ge=4, le=128, description="Integrable Bethe-ansatz root count"
    )
    baxter_q_depth: int = Field(
        default=12, ge=4, le=64, description="Baxter T-Q operator polynomial depth"
    )
    yangian_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Yang-Baxter RTT transfer coherence gain",
    )


@router.get("/yangians")
async def list_yangian_algebras():
    """List registered Quantum Affine & Yangian algebras."""
    shield = get_quantum_affine_yangian_shield()
    return {"yangians": shield.get_yangians()}


@router.post("/seal-yangian")
async def seal_yangian_rmatrix_route(request: SealYangianRequest):
    """Seal Yang-Baxter RTT relations and lock q-character transfer eigenvalues."""
    shield = get_quantum_affine_yangian_shield()
    try:
        return shield.seal_yangian_rmatrix(
            yangian_id=request.yangian_id,
            yangian_rank=request.yangian_rank,
            bethe_roots_count=request.bethe_roots_count,
            baxter_q_depth=request.baxter_q_depth,
            yangian_gain=request.yangian_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_yangian_metrics():
    """Retrieve aggregate Quantum Affine Algebra & Yangian Shield metrics."""
    shield = get_quantum_affine_yangian_shield()
    return shield.get_yangian_metrics()
