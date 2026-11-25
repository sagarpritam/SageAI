"""
FastAPI Router for Fontaine-Mazur Galois Geometricity Firewall (Capability 214).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.fontaine_mazur_galois_geometricity_firewall import (
    get_fontaine_mazur_galois_geometricity_firewall_service,
)

router = APIRouter(
    prefix="/api/fontaine-mazur-geometricity",
    tags=["Fontaine-Mazur Galois Firewall"],
)


class EvaluateGaloisGeometricityRequest(BaseModel):
    rep_id: str = Field(..., description="ID of p-adic Galois representation")
    prime_p: Optional[int] = Field(5, description="Prime p")
    hodge_tate_span: Optional[int] = Field(2, description="Hodge-Tate weight span")
    firewall_gain: Optional[float] = Field(1.25, description="Firewall gain multiplier")


@router.get("/representations")
async def list_representations():
    service = get_fontaine_mazur_galois_geometricity_firewall_service()
    return {"representations": service.list_representations()}


@router.post("/evaluate-galois-geometricity")
async def evaluate_galois_geometricity(request: EvaluateGaloisGeometricityRequest):
    service = get_fontaine_mazur_galois_geometricity_firewall_service()
    try:
        return service.evaluate_galois_geometricity(
            rep_id=request.rep_id,
            prime_p=request.prime_p or 5,
            hodge_tate_span=request.hodge_tate_span or 2,
            firewall_gain=request.firewall_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_fontaine_mazur_galois_geometricity_firewall_service()
    return service.get_metrics()
