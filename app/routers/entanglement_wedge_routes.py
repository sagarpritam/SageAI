"""
FastAPI Router for Capability 130: Reflected Entropy (S_R) & Entanglement Wedge Cross-Section (E_W) Guard.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.entanglement_wedge_cross.entanglement_wedge_cross import (
    get_entanglement_wedge_cross_guard,
)

router = APIRouter(
    prefix="/api/entanglement-wedge-cross",
    tags=["Capability 130: Reflected Entropy S_R & Entanglement Wedge E_W Guard"],
)


class AuditWedgeRequest(BaseModel):
    wedge_id: str = Field(
        ..., description="ID of the entanglement wedge cross-section domain"
    )
    ew_area: float = Field(
        default=3.4,
        ge=1.0,
        le=24.0,
        description="Minimal entanglement wedge cross-section area E_W(A:B)",
    )
    mutual_information: float = Field(
        default=4.9,
        ge=0.0,
        le=40.0,
        description="Bipartite mutual information I(A:B)",
    )
    cross_section_boundaries: int = Field(
        default=2,
        ge=1,
        le=16,
        description="Number of cross-section extremal surface boundaries",
    )
    purification_gain: float = Field(
        default=1.5,
        ge=0.85,
        le=2.5,
        description="Canonical purification |sqrt(rho_AB)> stabilization gain",
    )


@router.get("/wedges")
async def list_wedges():
    """List all registered entanglement wedge cross-section domains."""
    guard = get_entanglement_wedge_cross_guard()
    return {"wedges": guard.get_wedges()}


@router.post("/audit-wedge")
async def audit_wedge_route(request: AuditWedgeRequest):
    """Audit S_R = 2*E_W duality and Markov gap lower bound positivity."""
    guard = get_entanglement_wedge_cross_guard()
    try:
        return guard.audit_wedge_cross_section(
            wedge_id=request.wedge_id,
            ew_area=request.ew_area,
            mutual_information=request.mutual_information,
            cross_section_boundaries=request.cross_section_boundaries,
            purification_gain=request.purification_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_entanglement_wedge_metrics():
    """Retrieve aggregate entanglement wedge cross-section guard metrics."""
    guard = get_entanglement_wedge_cross_guard()
    return guard.get_entanglement_wedge_metrics()
