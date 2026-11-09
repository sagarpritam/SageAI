from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.cislunar_quantum_relay import cislunar_quantum_relay

router = APIRouter(
    prefix="/api/cislunar-relay", tags=["Cis-Lunar Quantum Relay (Cap 74)"]
)


class EstablishLinkRequest(BaseModel):
    source_id: str = Field(..., examples=["EARTH-OCP-TENERIFE"])
    target_id: str = Field(..., examples=["LAGRANGE-L1-HALO-1"])
    requested_oam_modes: Optional[List[int]] = Field(
        default=None, examples=[[-1], 0, 1]
    )
    atmospheric_turbulence_index: float = Field(default=0.15, ge=0.0, le=1.0)


@router.get("/nodes")
async def get_nodes() -> List[Dict[str, Any]]:
    return cislunar_quantum_relay.list_nodes()


@router.post("/establish-link")
async def establish_link(req: EstablishLinkRequest) -> Dict[str, Any]:
    try:
        return cislunar_quantum_relay.establish_quantum_link(
            source_id=req.source_id,
            target_id=req.target_id,
            requested_oam_modes=req.requested_oam_modes,
            atmospheric_turbulence_index=req.atmospheric_turbulence_index,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return cislunar_quantum_relay.get_relay_metrics()
