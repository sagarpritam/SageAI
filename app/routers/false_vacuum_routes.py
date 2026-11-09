from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.false_vacuum_shield import false_vacuum_decay_shield

router = APIRouter(
    prefix="/api/false-vacuum",
    tags=["False Vacuum Decay Bubble Nucleation Shield (Cap 91)"],
)


class QuenchNucleationRequest(BaseModel):
    chamber_id: str = Field(..., description="Target vacuum chamber ID")
    simulated_instanton_perturbation: str = Field(
        default="MICROSCOPIC_BLACK_HOLE_CATALYZED_TUNNELING",
        description="Perturbation profile"
    )
    counter_bias_power_tw: float = Field(default=48.0, ge=1.0, le=500.0, description="Counter-bias power in Terawatts")


@router.get("/chambers")
async def get_chambers() -> List[Dict[str, Any]]:
    return false_vacuum_decay_shield.list_chambers()


@router.post("/quench-nucleation")
async def quench_nucleation(req: QuenchNucleationRequest) -> Dict[str, Any]:
    try:
        return false_vacuum_decay_shield.quench_nucleation_seed(
            chamber_id=req.chamber_id,
            simulated_instanton_perturbation=req.simulated_instanton_perturbation,
            counter_bias_power_tw=req.counter_bias_power_tw,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return false_vacuum_decay_shield.get_shield_metrics()
