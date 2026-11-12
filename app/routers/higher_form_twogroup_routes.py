"""
FastAPI Router for Capability 127: 2-Group Higher-Form Green-Schwarz & Walker-Wang Anomaly Guard.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.higher_form_twogroup.higher_form_twogroup import (
    get_higher_form_twogroup_guard,
)

router = APIRouter(
    prefix="/api/higher-form-twogroup",
    tags=["Capability 127: 2-Group Higher-Form Green-Schwarz & Walker-Wang Guard"],
)


class AuditTwoGroupRequest(BaseModel):
    defect_id: str = Field(
        ..., description="ID of the 2-group higher-form defect complex"
    )
    postnikov_order: int = Field(
        default=4,
        ge=2,
        le=32,
        description="Postnikov class cohomology order [beta] in H^3(BG, A)",
    )
    walker_wang_rank: int = Field(
        default=8,
        ge=4,
        le=64,
        description="Walker-Wang 3+1D modular-functor ribbon rank",
    )
    inflow_coupling: float = Field(
        default=1.2,
        ge=0.5,
        le=4.0,
        description="Mixed 0-form/1-form anomaly inflow coupling constant",
    )
    green_schwarz_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Green-Schwarz 2-form Bianchi compensation gain",
    )


@router.get("/defects")
async def list_defects():
    """List all registered 2-group higher-form defect complexes."""
    guard = get_higher_form_twogroup_guard()
    return {"defects": guard.get_defects()}


@router.post("/audit-twogroup")
async def audit_twogroup_route(request: AuditTwoGroupRequest):
    """Audit Postnikov 2-group cohomology inflow and Green-Schwarz 2-form compensation."""
    guard = get_higher_form_twogroup_guard()
    try:
        return guard.audit_twogroup_inflow(
            defect_id=request.defect_id,
            postnikov_order=request.postnikov_order,
            walker_wang_rank=request.walker_wang_rank,
            inflow_coupling=request.inflow_coupling,
            green_schwarz_gain=request.green_schwarz_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_higher_form_twogroup_metrics():
    """Retrieve aggregate 2-group higher-form anomaly guard metrics."""
    guard = get_higher_form_twogroup_guard()
    return guard.get_higher_form_twogroup_metrics()
