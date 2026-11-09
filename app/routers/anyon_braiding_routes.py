from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.anyon_topological_braiding import anyon_topological_braiding

router = APIRouter(
    prefix="/api/anyon-braiding",
    tags=["Non-Abelian Anyon Topological Braiding Quantum Matrix (Cap 85)"],
)


class ExecuteBraidRequest(BaseModel):
    matrix_id: str = Field(..., example="ANYON-CORE-COPENHAGEN-01")
    braid_word: str = Field(default="sigma_1 * sigma_2^-1 * sigma_1", example="sigma_1 * sigma_2^-1 * sigma_1")
    target_qubit_id: str = Field(default="TOPO-QUBIT-01", example="TOPO-QUBIT-01")
    gate_type: str = Field(default="HADAMARD", example="HADAMARD")


@router.get("/matrices")
async def get_matrices() -> List[Dict[str, Any]]:
    return anyon_topological_braiding.list_matrices()


@router.post("/execute-braid")
async def execute_braid(req: ExecuteBraidRequest) -> Dict[str, Any]:
    try:
        return anyon_topological_braiding.execute_braid_operation(
            matrix_id=req.matrix_id,
            braid_word=req.braid_word,
            target_qubit_id=req.target_qubit_id,
            gate_type=req.gate_type,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return anyon_topological_braiding.get_topological_metrics()

