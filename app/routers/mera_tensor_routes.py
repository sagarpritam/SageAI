"""
FastAPI Router for Capability 131: MERA & Continuous cMERA Tensor Renormalization Circuit Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.mera_tensor_renorm.mera_tensor_renorm import (
    get_mera_tensor_renorm_firewall,
)

router = APIRouter(
    prefix="/api/mera-tensor-renorm",
    tags=["Capability 131: MERA / cMERA Tensor Renormalization Firewall"],
)


class RenormalizeConeRequest(BaseModel):
    network_id: str = Field(..., description="ID of the MERA/cMERA tensor network")
    bond_dim_chi: int = Field(
        default=32, ge=8, le=512, description="MERA tensor bond dimension chi"
    )
    rg_layers: int = Field(
        default=14,
        ge=4,
        le=64,
        description="Number of holographic RG coarse-graining layers",
    )
    central_charge: float = Field(
        default=12.0, ge=1.0, le=128.0, description="Boundary CFT central charge c"
    )
    disentangler_gain: float = Field(
        default=1.5, ge=0.85, le=2.5, description="Unitary disentangler clamping gain"
    )


@router.get("/networks")
async def list_networks():
    """List registered MERA/cMERA tensor networks."""
    fw = get_mera_tensor_renorm_firewall()
    return {"networks": fw.get_networks()}


@router.post("/renormalize-cone")
async def renormalize_cone_route(request: RenormalizeConeRequest):
    """Contract MERA causal-cone ascending superoperator and seal truncation drift."""
    fw = get_mera_tensor_renorm_firewall()
    try:
        return fw.renormalize_causal_cone(
            network_id=request.network_id,
            bond_dim_chi=request.bond_dim_chi,
            rg_layers=request.rg_layers,
            central_charge=request.central_charge,
            disentangler_gain=request.disentangler_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_mera_metrics():
    """Retrieve aggregate MERA/cMERA tensor firewall telemetry."""
    fw = get_mera_tensor_renorm_firewall()
    return fw.get_mera_metrics()
