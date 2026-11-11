"""
FastAPI Router for Capability 111: Penrose Twistor-Space Holomorphic Curvature Stabilizer.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.twistor_holonomy.twistor_holonomy import (
    get_twistor_holonomy_stabilizer,
)

router = APIRouter(
    prefix="/api/twistor-holonomy",
    tags=["Capability 111: Penrose Twistor-Space Holonomy"],
)


class StabilizeHolonomyRequest(BaseModel):
    fibration_id: str = Field(
        ..., description="ID of the CP^3 twistor cohomology fibration"
    )
    helicity_charge_2s: int = Field(
        default=4,
        ge=-6,
        le=6,
        description="SU(2,2) twistor helicity homogeneity degree 2s",
    )
    kodaira_deformation_eps: float = Field(
        default=0.08,
        ge=0.01,
        le=0.45,
        description="Kodaira-Spencer H^1(PT_+, O(n)) deformation amplitude",
    )
    shear_damping_gain: float = Field(
        default=1.2,
        ge=0.8,
        le=2.5,
        description="Sparling-Ward null-geodesic shear damping gain",
    )


@router.get("/fibrations")
async def list_fibrations():
    """List all registered CP^3 twistor cohomology fibrations."""
    stabilizer = get_twistor_holonomy_stabilizer()
    return {"fibrations": stabilizer.get_fibrations()}


@router.post("/stabilize-holonomy")
async def stabilize_holonomy_route(request: StabilizeHolonomyRequest):
    """Stabilize holomorphic twistor cohomology and clamp null shear."""
    stabilizer = get_twistor_holonomy_stabilizer()
    try:
        return stabilizer.stabilize_holonomy(
            fibration_id=request.fibration_id,
            helicity_charge_2s=request.helicity_charge_2s,
            kodaira_deformation_eps=request.kodaira_deformation_eps,
            shear_damping_gain=request.shear_damping_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_twistor_metrics():
    """Retrieve aggregate Penrose twistor-space holonomy stabilizer metrics."""
    stabilizer = get_twistor_holonomy_stabilizer()
    return stabilizer.get_twistor_metrics()
