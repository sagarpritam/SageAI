import re
from fastapi import APIRouter, HTTPException, Request

from app.core.rate_limit import limiter
from app.services.ai_explainer import explain_finding

router = APIRouter(prefix="/explain", tags=["AI Explainer"])


@router.get("/{finding_type}")
@limiter.limit("60/minute")
async def get_explanation(request: Request, finding_type: str):
    """Get an AI-powered explanation for a vulnerability type.

    Examples: `Missing Security Headers`, `Reflected XSS`, `SQL Injection`
    """
    # Sanitize finding_type to prevent injection and oversized parameters
    sanitized = re.sub(r"[^\w\s\-_\.]", "", finding_type).strip()[:100]
    if not sanitized:
        raise HTTPException(status_code=400, detail="Invalid finding type")
    return explain_finding(sanitized)
