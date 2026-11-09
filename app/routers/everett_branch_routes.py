from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.everett_branch_resolver import everett_branch_resolver

router = APIRouter(
    prefix="/api/everett-branch",
    tags=["Everett-Wheeler Quantum Branch Entropy Decoherence Resolver (Cap 89)"],
)


class ResolveBranchEntropyRequest(BaseModel):
    primary_branch_id: str = Field(
        default="EVERETT-BRANCH-PRIME-01", description="Primary consensus branch ID"
    )
    phase_alignment_gain: float = Field(
        default=1.0, ge=0.1, le=10.0, description="Inter-branch phase alignment gain"
    )


@router.get("/branches")
async def get_branches() -> List[Dict[str, Any]]:
    return everett_branch_resolver.list_branches()


@router.post("/resolve-entropy")
async def resolve_entropy(req: ResolveBranchEntropyRequest) -> Dict[str, Any]:
    try:
        return everett_branch_resolver.resolve_branch_entropy(
            primary_branch_id=req.primary_branch_id,
            phase_alignment_gain=req.phase_alignment_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return everett_branch_resolver.get_resolution_metrics()
