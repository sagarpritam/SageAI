from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.quantum_gravitational_sensor import quantum_gravitational_sensor

router = APIRouter(
    prefix="/api/quantum-gravitational",
    tags=["Spacetime Metric Distortions & Quantum Gravitational Entanglement (Cap 80)"],
)


class MeasureDistortionRequest(BaseModel):
    node_id: str = Field(..., example="QGRAV-NODE-GENEVA-01")
    target_region: str = Field(default="LOCAL_EARTH_GEOID_SECTOR_7", example="LOCAL_EARTH_GEOID_SECTOR_7")
    integration_time_sec: float = Field(default=30.0, ge=1.0, le=3600.0)


@router.get("/nodes")
async def get_nodes() -> List[Dict[str, Any]]:
    return quantum_gravitational_sensor.list_nodes()


@router.post("/measure-distortion")
async def measure_distortion(req: MeasureDistortionRequest) -> Dict[str, Any]:
    try:
        return quantum_gravitational_sensor.measure_metric_distortion(
            node_id=req.node_id,
            target_region=req.target_region,
            integration_time_sec=req.integration_time_sec,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return quantum_gravitational_sensor.get_sensor_metrics()

