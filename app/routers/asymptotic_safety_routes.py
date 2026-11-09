from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.asymptotic_safety_stabilizer import get_asymptotic_safety_stabilizer

router = APIRouter(
    prefix="/api/asymptotic-safety",
    tags=["Asymptotically Safe Quantum Gravity RG Flow Stabilizer (Cap 98)"],
)


class StabilizeFlowRequest(BaseModel):
    node_id: str = Field(..., description="Target RG scale node ID")
    flow_momentum_k_gev: float = Field(default=1.2e19, ge=1e15, le=1e22, description="Target cutoff momentum scale k in GeV")
    regulator_shape_parameter: float = Field(default=1.0, ge=0.1, le=10.0, description="Wetterich-Morris regulator shape factor")


@router.get("/nodes")
async def get_nodes() -> List[Dict[str, Any]]:
    stabilizer = get_asymptotic_safety_stabilizer()
    return stabilizer.list_nodes()


@router.post("/stabilize-flow")
async def stabilize_flow(req: StabilizeFlowRequest) -> Dict[str, Any]:
    try:
        stabilizer = get_asymptotic_safety_stabilizer()
        return stabilizer.stabilize_rg_flow(
            node_id=req.node_id,
            flow_momentum_k_gev=req.flow_momentum_k_gev,
            regulator_shape_parameter=req.regulator_shape_parameter,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    stabilizer = get_asymptotic_safety_stabilizer()
    return stabilizer.get_stabilizer_metrics()

