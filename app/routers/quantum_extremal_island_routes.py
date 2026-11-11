"""
FastAPI Router for Capability 114: AdS/BCFT Takayanagi Island Quantum Extremal Surface Auditor.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.quantum_extremal_island.quantum_extremal_island import (
    get_quantum_extremal_island_auditor,
)

router = APIRouter(
    prefix="/api/quantum-extremal-island",
    tags=["Capability 114: AdS/BCFT Takayanagi Island QES & Page Curve Auditor"],
)


class AuditPageCurveRequest(BaseModel):
    horizon_id: str = Field(
        ..., description="ID of the AdS/BCFT horizon radiation system"
    )
    bekenstein_hawking_entropy_s0: float = Field(
        default=180.0,
        ge=40.0,
        le=1000.0,
        description="Initial Bekenstein-Hawking horizon entropy S_0",
    )
    evaporation_page_ratio: float = Field(
        default=1.35,
        ge=0.2,
        le=3.0,
        description="Dimensionless radiation time ratio t / t_Page",
    )
    cft_central_charge_c: int = Field(
        default=24,
        ge=1,
        le=256,
        description="Boundary CFT central charge c",
    )
    wormhole_saddle_gain: float = Field(
        default=1.25,
        ge=0.8,
        le=2.5,
        description="Replica-wormhole island saddle coupling gain",
    )


@router.get("/horizons")
async def list_horizons():
    """List all registered AdS/BCFT Quantum Extremal Island horizons."""
    auditor = get_quantum_extremal_island_auditor()
    return {"horizons": auditor.get_horizons()}


@router.post("/audit-page-curve")
async def audit_page_curve_route(request: AuditPageCurveRequest):
    """Extremize QES generalized entropy & verify unitary Page curve turnover."""
    auditor = get_quantum_extremal_island_auditor()
    try:
        return auditor.audit_page_curve(
            horizon_id=request.horizon_id,
            bekenstein_hawking_entropy_s0=request.bekenstein_hawking_entropy_s0,
            evaporation_page_ratio=request.evaporation_page_ratio,
            cft_central_charge_c=request.cft_central_charge_c,
            wormhole_saddle_gain=request.wormhole_saddle_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_qes_metrics():
    """Retrieve aggregate Quantum Extremal Island Page Curve metrics."""
    auditor = get_quantum_extremal_island_auditor()
    return auditor.get_qes_metrics()
