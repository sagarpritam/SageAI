from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.centesimal_quantum_gravity import get_centesimal_quantum_gravity_synthesizer

router = APIRouter(
    prefix="/api/centesimal-quantum-gravity",
    tags=["Centesimal Quantum Gravity Singularity-Free Metric Synthesizer (Cap 100)"],
)


class SynthesizeMetricRequest(BaseModel):
    fabric_id: str = Field(..., description="Target spacetime fabric node ID")
    bounce_damping_factor: float = Field(default=1.0, ge=0.1, le=10.0, description="Quantum bounce damping factor")
    area_gap_gain: float = Field(default=1.0, ge=0.1, le=10.0, description="Loop area-gap gain factor")


@router.get("/fabrics")
async def get_fabrics() -> List[Dict[str, Any]]:
    synthesizer = get_centesimal_quantum_gravity_synthesizer()
    return synthesizer.list_fabrics()


@router.post("/synthesize-metric")
async def synthesize_metric(req: SynthesizeMetricRequest) -> Dict[str, Any]:
    try:
        synthesizer = get_centesimal_quantum_gravity_synthesizer()
        return synthesizer.synthesize_singularity_free_metric(
            fabric_id=req.fabric_id,
            bounce_damping_factor=req.bounce_damping_factor,
            area_gap_gain=req.area_gap_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    synthesizer = get_centesimal_quantum_gravity_synthesizer()
    return synthesizer.get_centesimal_metrics()
