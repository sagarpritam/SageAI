"""
FastAPI Router for Capability 128: BFSS / IKKT M-Theory Matrix Model & Fuzzball Microstate Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.matrix_bfss_fuzzball.matrix_bfss_fuzzball import (
    get_matrix_bfss_fuzzball_firewall,
)

router = APIRouter(
    prefix="/api/matrix-bfss-fuzzball",
    tags=["Capability 128: BFSS Matrix Model & Fuzzball Microstate Firewall"],
)


class LockFuzzballRequest(BaseModel):
    config_id: str = Field(
        ..., description="ID of the BFSS / IKKT matrix configuration"
    )
    matrix_rank_n: int = Field(
        default=64,
        ge=16,
        le=1024,
        description="SU(N) matrix rank for non-abelian commutator evaluation",
    )
    thooft_coupling: float = Field(
        default=4.2,
        ge=0.5,
        le=25.0,
        description="Dimensionless 't Hooft matrix coupling lambda",
    )
    mu_mass_gap: float = Field(
        default=1.65,
        ge=0.25,
        le=8.0,
        description="BMN plane-wave mass deformation parameter mu",
    )
    commutator_clamp_gain: float = Field(
        default=1.5,
        ge=0.85,
        le=2.5,
        description="Horizonless microstate dispersion clamp gain",
    )


@router.get("/configurations")
async def list_configurations():
    """List all registered BFSS / IKKT fuzzball configurations."""
    fw = get_matrix_bfss_fuzzball_firewall()
    return {"configurations": fw.get_configurations()}


@router.post("/lock-fuzzball")
async def lock_fuzzball_route(request: LockFuzzballRequest):
    """Evaluate commutator norm and lock horizonless fuzzball microstates."""
    fw = get_matrix_bfss_fuzzball_firewall()
    try:
        return fw.lock_fuzzball_microstate(
            config_id=request.config_id,
            matrix_rank_n=request.matrix_rank_n,
            thooft_coupling=request.thooft_coupling,
            mu_mass_gap=request.mu_mass_gap,
            commutator_clamp_gain=request.commutator_clamp_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_matrix_bfss_metrics():
    """Retrieve aggregate BFSS / IKKT fuzzball firewall metrics."""
    fw = get_matrix_bfss_fuzzball_firewall()
    return fw.get_matrix_bfss_metrics()
