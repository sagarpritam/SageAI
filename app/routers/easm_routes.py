"""
FastAPI Router for External Attack Surface Management (EASM) & Shadow IT Hunter.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.easm.shadow_it_hunter import shadow_it_hunter

router = APIRouter(prefix="/easm", tags=["External Attack Surface Management & Shadow IT"])


class ScanPerimeterRequest(BaseModel):
    target_domain: str = Field("enterprise.com", description="Target corporate domain")


@router.post("/scan")
@limiter.limit("20/minute")
async def scan_external_perimeter(
    request: Request,
    payload: ScanPerimeterRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Scans external attack surface for subdomains, dangling DNS, and shadow IT assets.
    """
    org_id = str(current_user.get("org", "system"))
    user_id = str(current_user.get("sub", "EASM-Scanner"))

    result = shadow_it_hunter.scan_external_attack_surface(
        target_domain=payload.target_domain,
        org_id=org_id,
        actor=user_id,
    )
    return result

