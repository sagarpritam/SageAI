"""FastAPI Router for Capability 171: Superstring Calabi-Yau Mirror Symmetry Wall."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.calabi_yau_mirror_wall.calabi_yau_mirror_wall import (
    get_calabi_yau_mirror_wall_service,
)

router = APIRouter(
    prefix="/api/calabi-yau-mirror",
    tags=["Capability 171: Calabi-Yau Mirror Wall"],
)


class SolvePicardFuchsRequest(BaseModel):
    pair_id: str = Field(..., description="ID of the Calabi-Yau mirror pair")
    deformation_psi: float = Field(
        default=0.5, ge=0.1, le=10.0, description="Complex structure deformation parameter psi"
    )
    instanton_degree: int = Field(
        default=4, ge=1, le=5, description="Maximum degree d for instanton invariant extraction"
    )
    monodromy_damping: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Picard-Lefschetz monodromy damping gain"
    )
    frobenius_precision: float = Field(
        default=1e-6, ge=1e-12, le=1e-2, description="Frobenius solution series precision"
    )


@router.get("/pairs")
async def list_calabi_yau_pairs():
    """List registered Calabi-Yau mirror pairs."""
    svc = get_calabi_yau_mirror_wall_service()
    return {"pairs": svc.get_pairs()}


@router.post("/solve-picard-fuchs")
async def solve_picard_fuchs_differential(request: SolvePicardFuchsRequest):
    """Solve Picard-Fuchs differential system and calculate instanton invariants."""
    svc = get_calabi_yau_mirror_wall_service()
    try:
        return svc.solve_picard_fuchs(
            pair_id=request.pair_id,
            deformation_psi=request.deformation_psi,
            instanton_degree=request.instanton_degree,
            monodromy_damping=request.monodromy_damping,
            frobenius_precision=request.frobenius_precision,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_calabi_yau_metrics():
    """Return operational metrics for Calabi-Yau mirror wall."""
    svc = get_calabi_yau_mirror_wall_service()
    return svc.get_metrics()
