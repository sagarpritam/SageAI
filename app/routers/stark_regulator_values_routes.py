"""
FastAPI Router for Stark Regulator & Artin L-Function Special Values Firewall (Capability 217).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.stark_regulator_special_values_firewall import (
    get_stark_regulator_special_values_firewall_service,
)

router = APIRouter(
    prefix="/api/stark-regulator-values",
    tags=["Stark Regulator Firewall"],
)


class EvaluateStarkRegulatorRequest(BaseModel):
    regulator_id: str = Field(..., description="ID of Stark regulator configuration")
    vanishing_order_r: Optional[int] = Field(1, description="Order of vanishing r at s=0")
    class_number_h: Optional[int] = Field(1, description="Ray class number h")
    firewall_gain: Optional[float] = Field(1.25, description="Firewall gain multiplier")


@router.get("/regulators")
async def list_regulators():
    service = get_stark_regulator_special_values_firewall_service()
    return {"regulators": service.list_regulators()}


@router.post("/evaluate-stark-regulator")
async def evaluate_stark_regulator(request: EvaluateStarkRegulatorRequest):
    service = get_stark_regulator_special_values_firewall_service()
    try:
        return service.evaluate_stark_regulator(
            regulator_id=request.regulator_id,
            vanishing_order_r=request.vanishing_order_r or 1,
            class_number_h=request.class_number_h or 1,
            firewall_gain=request.firewall_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_stark_regulator_special_values_firewall_service()
    return service.get_metrics()
