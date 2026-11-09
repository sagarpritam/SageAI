"""
FastAPI Router for Web3 & Smart Contract Security Audit Engine.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.web3_security.smart_contract_auditor import smart_contract_auditor

router = APIRouter(prefix="/web3-security", tags=["Web3 & Smart Contract Security"])


class AuditContractRequest(BaseModel):
    source_code: Optional[str] = Field(None, description="Smart contract source code in Solidity/Rust/Move")
    contract_name: Optional[str] = Field("VulnerableVault.sol", description="Contract filename or label")
    chain: Optional[str] = Field("Ethereum (EVM)", description="Blockchain ecosystem")


class GeneratePoCRequest(BaseModel):
    contract_name: Optional[str] = Field("VulnerableVault.sol", description="Contract to generate Foundry PoC for")


@router.post("/audit")
@limiter.limit("30/minute")
async def audit_smart_contract_endpoint(
    request: Request,
    payload: AuditContractRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Audits smart contracts for Reentrancy (SWC-107), access control, and flash loan oracle manipulation."""
    report = smart_contract_auditor.audit_contract_code(
        source_code=payload.source_code,
        contract_name=payload.contract_name or "VulnerableVault.sol",
        chain=payload.chain or "Ethereum (EVM)",
    )
    return {"status": "success", "audit_report": report}


@router.post("/foundry-poc")
@limiter.limit("30/minute")
async def generate_foundry_poc_endpoint(
    request: Request,
    payload: GeneratePoCRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Synthesizes a Foundry (Forge) Proof-of-Concept exploit test for discovered vulnerabilities."""
    poc = smart_contract_auditor.generate_foundry_poc(
        contract_name=payload.contract_name or "VulnerableVault.sol"
    )
    return {"status": "success", "foundry_poc": poc}

