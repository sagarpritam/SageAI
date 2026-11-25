"""
FastAPI router for Capability 181: Grothendieck-Teichmüller Group & Dessins d'Enfants Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.grothendieck_teichmuller_galois_firewall import (
    get_grothendieck_teichmuller_galois_firewall_service,
)

router = APIRouter(
    prefix="/api/grothendieck-teichmuller-galois",
    tags=["Grothendieck-Teichmuller Galois Firewall"],
)


class EvaluateAssociatorRequest(BaseModel):
    dessin_id: str = Field(..., description="ID of the dessin d'enfant")
    drinfeld_lambda: float = Field(
        default=1.0, ge=0.1, le=5.0, description="Drinfeld associator scaling parameter lambda"
    )
    associator_order: int = Field(
        default=4, ge=1, le=10, description="Lie bracket filtration order"
    )
    firewall_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Galois arithmetic pinning gain"
    )


@router.get("/dessins")
async def list_dessins():
    """List registered dessins d'enfants."""
    svc = get_grothendieck_teichmuller_galois_firewall_service()
    return {"dessins": svc.get_dessins()}


@router.post("/evaluate-associator")
async def evaluate_associator(request: EvaluateAssociatorRequest):
    """Evaluate Drinfeld-KZ associator and lock Galois arithmetic invariance."""
    svc = get_grothendieck_teichmuller_galois_firewall_service()
    try:
        return svc.evaluate_associator(
            dessin_id=request.dessin_id,
            drinfeld_lambda=request.drinfeld_lambda,
            associator_order=request.associator_order,
            firewall_gain=request.firewall_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_grothendieck_metrics():
    """Return operational metrics for Grothendieck-Teichmuller firewall."""
    svc = get_grothendieck_teichmuller_galois_firewall_service()
    return svc.get_metrics()
