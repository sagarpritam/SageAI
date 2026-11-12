"""
FastAPI Router for Capability 135: Batalin-Vilkovisky (BV) Antifield BRST Cohomology Master Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.bv_brst_cohomology.bv_brst_cohomology import (
    get_bv_brst_cohomology_shield,
)

router = APIRouter(
    prefix="/api/bv-brst-cohomology",
    tags=["Capability 135: BV Antifield BRST Cohomology Master Shield"],
)


class EnforceMasterEquationRequest(BaseModel):
    complex_id: str = Field(
        ..., description="ID of the BV-BRST antifield cohomology complex"
    )
    ghost_number_grading: int = Field(
        default=2,
        ge=1,
        le=16,
        description="BRST ghost-number grading sector",
    )
    antifield_bracket_order: int = Field(
        default=4,
        ge=2,
        le=32,
        description="BV odd symplectic antibracket expansion order",
    )
    gauge_fermion_xi: float = Field(
        default=1.2,
        ge=0.25,
        le=6.0,
        description="Gauge-fixing fermion xi Lagrangian shift",
    )
    brst_gain: float = Field(
        default=1.5,
        ge=0.85,
        le=2.5,
        description="Nilpotent Q^2 = 0 BRST damping gain",
    )


@router.get("/complexes")
async def list_complexes():
    """List registered BV-BRST antifield cohomology complexes."""
    shield = get_bv_brst_cohomology_shield()
    return {"complexes": shield.get_complexes()}


@router.post("/enforce-master")
async def enforce_master_route(request: EnforceMasterEquationRequest):
    """Verify BV odd Laplacian closure and seal physical ghost-number-0 BRST cohomology."""
    shield = get_bv_brst_cohomology_shield()
    try:
        return shield.enforce_quantum_master_equation(
            complex_id=request.complex_id,
            ghost_number_grading=request.ghost_number_grading,
            antifield_bracket_order=request.antifield_bracket_order,
            gauge_fermion_xi=request.gauge_fermion_xi,
            brst_gain=request.brst_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_bv_brst_metrics():
    """Retrieve aggregate BV-BRST Antifield Cohomology Shield telemetry."""
    shield = get_bv_brst_cohomology_shield()
    return shield.get_bv_brst_metrics()
