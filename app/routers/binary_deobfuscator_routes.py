"""
FastAPI Router for Symbolic Binary Execution & Polymorphic De-Obfuscation.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.binary_deobfuscator.symbolic_deobfuscator import (
    symbolic_binary_deobfuscator,
)

router = APIRouter(
    prefix="/binary-deobfuscator",
    tags=["Symbolic Binary De-Obfuscator"],
)


class AnalyzeSampleRequest(BaseModel):
    sample_name: Optional[str] = "LummaStealer_Packed_Dropper.bin"
    custom_asm: Optional[str] = None


class SolveOpaquePredicatesRequest(BaseModel):
    expressions: List[str] = Field(
        ..., description="Mathematical opaque predicate expressions to solve"
    )


class UnhashApiRequest(BaseModel):
    hashes: List[str] = Field(
        ..., description="List of hexadecimal API hashes (e.g. 0x006a4abc)"
    )
    algorithm: Optional[str] = "ROR13"


@router.get("/samples")
@limiter.limit("60/minute")
async def get_samples_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves laboratory obfuscated samples."""
    return {
        "status": "success",
        "samples": symbolic_binary_deobfuscator.get_sample_library(),
    }


@router.post("/analyze")
@limiter.limit("30/minute")
async def analyze_deobfuscate_endpoint(
    request: Request,
    payload: AnalyzeSampleRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Deobfuscates control flow flattening, unhashes APIs, and generates YARA-L rules."""
    return symbolic_binary_deobfuscator.deobfuscate_control_flow(
        sample_name=payload.sample_name or "LummaStealer_Packed_Dropper.bin",
        custom_asm=payload.custom_asm,
        operator=current_user.get("email", "SecOpsReverseEngineer"),
    )


@router.post("/solve-opaque-predicates")
@limiter.limit("30/minute")
async def solve_predicates_endpoint(
    request: Request,
    payload: SolveOpaquePredicatesRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Uses Z3 SMT solver logic to evaluate and eliminate opaque predicates."""
    solved = symbolic_binary_deobfuscator.solve_opaque_predicates(payload.expressions)
    return {"status": "success", "solved_predicates": solved}


@router.post("/unhash-apis")
@limiter.limit("30/minute")
async def unhash_apis_endpoint(
    request: Request,
    payload: UnhashApiRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Resolves obfuscated API hashes to plaintext Windows APIs."""
    unhashed = symbolic_binary_deobfuscator.unhash_apis(
        payload.hashes, payload.algorithm or "ROR13"
    )
    return {"status": "success", "unhashed_apis": unhashed}
