from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.horava_lifshitz_governor import get_horava_lifshitz_governor

router = APIRouter(
    prefix="/api/horava-lifshitz",
    tags=["Horava-Lifshitz Anisotropic Lifshitz Scaling Governor (Cap 99)"],
)


class GovernScalingRequest(BaseModel):
    domain_id: str = Field(..., description="Target Horava foliation domain ID")
    target_exponent_z: float = Field(default=3.0, ge=1.0, le=4.0, description="Dynamical critical exponent z")
    foliation_damping_gain: float = Field(default=1.0, ge=0.1, le=10.0, description="Foliation-preserving damping gain")


@router.get("/domains")
async def get_domains() -> List[Dict[str, Any]]:
    governor = get_horava_lifshitz_governor()
    return governor.list_domains()


@router.post("/govern-scaling")
async def govern_scaling(req: GovernScalingRequest) -> Dict[str, Any]:
    try:
        governor = get_horava_lifshitz_governor()
        return governor.govern_lifshitz_scaling(
            domain_id=req.domain_id,
            target_exponent_z=req.target_exponent_z,
            foliation_damping_gain=req.foliation_damping_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    governor = get_horava_lifshitz_governor()
    return governor.get_governor_metrics()

