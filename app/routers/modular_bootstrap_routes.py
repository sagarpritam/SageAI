"""
FastAPI Router for Capability 124: Modular Bootstrap & Mock-Theta Rademacher Unitarity Guard.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.modular_bootstrap.modular_bootstrap import (
    get_modular_bootstrap_guard,
)

router = APIRouter(
    prefix="/api/modular-bootstrap",
    tags=["Capability 124: Modular Bootstrap & Rademacher Unitarity Guard"],
)


class AuditModularRequest(BaseModel):
    genus_id: str = Field(..., description="ID of the modular bootstrap spectrum genus")
    central_charge: float = Field(
        default=24.0,
        ge=1.0,
        le=512.0,
        description="2D CFT central charge c for Hellerman gap bound",
    )
    spin_cutoff: int = Field(
        default=12,
        ge=2,
        le=128,
        description="Maximum spin trajectory cutoff for Regge sum verification",
    )
    functional_depth: float = Field(
        default=1.5,
        ge=0.85,
        le=2.5,
        description="Linear-programming extremal derivative functional depth",
    )


@router.get("/genera")
async def list_genera():
    """List all registered modular bootstrap spectral genera."""
    guard = get_modular_bootstrap_guard()
    return {"genera": guard.get_genera()}


@router.post("/audit-modular")
async def audit_modular_route(request: AuditModularRequest):
    """Audit SL(2, Z) partition invariance, Hellerman gap, and Rademacher series."""
    guard = get_modular_bootstrap_guard()
    try:
        return guard.audit_modular_partition(
            genus_id=request.genus_id,
            central_charge=request.central_charge,
            spin_cutoff=request.spin_cutoff,
            functional_depth=request.functional_depth,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_modular_metrics():
    """Retrieve aggregate modular bootstrap guard metrics."""
    guard = get_modular_bootstrap_guard()
    return guard.get_modular_metrics()
