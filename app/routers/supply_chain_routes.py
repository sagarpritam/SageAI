"""
FastAPI Router for Software Supply Chain Security & SBOM Vulnerability Graph.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.supply_chain.sbom_scanner import sbom_scanner

router = APIRouter(prefix="/supply-chain", tags=["Software Supply Chain & SBOM"])


class ScanManifestRequest(BaseModel):
    manifest_content: str = Field(..., description="Raw requirements.txt or package.json content")
    project_name: Optional[str] = Field("SageAI-Core", description="Project or component name")


@router.post("/scan")
@limiter.limit("30/minute")
async def scan_software_supply_chain(
    request: Request,
    payload: ScanManifestRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Parses manifest, generates CycloneDX 1.5 JSON SBOM, detects typosquatting and CVEs.
    """
    org_id = str(current_user.get("org", "system"))
    user_id = str(current_user.get("sub", "SBOM-Scanner"))

    result = sbom_scanner.scan_supply_chain(
        manifest_content=payload.manifest_content,
        project_name=payload.project_name or "SageAI-Core",
        org_id=org_id,
        actor=user_id,
    )
    return result

