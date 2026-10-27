import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.encryption import encrypt
from app.core.rate_limit import limiter
from app.core.security import get_current_user, require_role
from app.models.organization import Organization
from app.schemas.integration import (
    GitHubTokenRequest,
    IntegrationStatusResponse,
    SaveIntegrationRequest,
    VerifyKeyRequest,
    VerifyKeyResponse,
)
from app.services.integrations.verifier import (
    get_all_integrations_status,
    update_env_file,
    verify_censys_credentials,
    verify_github_pat,
    verify_nvidia_key,
    verify_shodan_key,
    verify_virustotal_key,
)

logger = logging.getLogger("SageAI.integrations")
router = APIRouter(prefix="/integrations", tags=["Integrations"])


# ── Consolidated Status & Verification ──────────────────────────


@router.get("/all/status")
@limiter.limit("30/minute")
async def get_all_status(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve the real-time operational status of all AI & OSINT integrations."""
    org = (
        await db.get(Organization, current_user["org"])
        if current_user.get("org")
        else None
    )
    status_data = get_all_integrations_status()
    status_data["github"] = {
        "configured": bool(org.github_token_encrypted) if org else False,
        "bot_enabled": bool(org.github_token_encrypted) if org else False,
    }
    return status_data


@router.post("/verify", response_model=VerifyKeyResponse)
@limiter.limit("10/minute")
async def verify_candidate_key(
    request: Request,
    payload: VerifyKeyRequest,
    current_user: dict = Depends(get_current_user),
):
    """Probe candidate API keys live against third-party provider endpoints."""
    provider = payload.provider.lower().strip()

    if provider == "nvidia":
        res = await verify_nvidia_key(payload.key)
    elif provider == "censys":
        res = await verify_censys_credentials(payload.key, payload.secondary_key or "")
    elif provider == "shodan":
        res = await verify_shodan_key(payload.key)
    elif provider == "virustotal":
        res = await verify_virustotal_key(payload.key)
    elif provider == "github":
        res = await verify_github_pat(payload.key)
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported integration provider: {provider}",
        )

    return VerifyKeyResponse(
        valid=res.get("valid", False),
        provider=provider,
        message=res.get("message"),
        error=res.get("error"),
        latency_ms=res.get("latency_ms"),
        model=res.get("model"),
    )


@router.post("/save")
@limiter.limit("10/minute")
async def save_integration(
    request: Request,
    payload: SaveIntegrationRequest,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Verify and persist API key to environment and runtime settings (admin only)."""
    provider = payload.provider.lower().strip()

    # 1. Live verification first
    if provider == "nvidia":
        verify_res = await verify_nvidia_key(payload.key)
        if not verify_res.get("valid"):
            raise HTTPException(
                status_code=400,
                detail=verify_res.get("error", "Invalid NVIDIA API key."),
            )
        update_env_file({"NVIDIA_API_KEY": payload.key.strip()})

    elif provider == "censys":
        verify_res = await verify_censys_credentials(
            payload.key, payload.secondary_key or ""
        )
        if not verify_res.get("valid"):
            raise HTTPException(
                status_code=400,
                detail=verify_res.get("error", "Invalid Censys credentials."),
            )
        update_env_file(
            {
                "CENSYS_API_ID": payload.key.strip(),
                "CENSYS_API_SECRET": (payload.secondary_key or "").strip(),
            }
        )

    elif provider == "shodan":
        verify_res = await verify_shodan_key(payload.key)
        if not verify_res.get("valid"):
            raise HTTPException(
                status_code=400,
                detail=verify_res.get("error", "Invalid Shodan API key."),
            )
        update_env_file({"SHODAN_API_KEY": payload.key.strip()})

    elif provider == "virustotal":
        verify_res = await verify_virustotal_key(payload.key)
        if not verify_res.get("valid"):
            raise HTTPException(
                status_code=400,
                detail=verify_res.get("error", "Invalid VirusTotal API key."),
            )
        update_env_file({"VIRUSTOTAL_API_KEY": payload.key.strip()})

    elif provider == "github":
        verify_res = await verify_github_pat(payload.key)
        if not verify_res.get("valid"):
            raise HTTPException(
                status_code=400, detail=verify_res.get("error", "Invalid GitHub PAT.")
            )
        org = await db.get(Organization, current_user["org"])
        if org:
            org.github_token_encrypted = encrypt(payload.key.strip())
            await db.commit()
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    return {
        "success": True,
        "provider": provider,
        "message": f"Successfully verified and saved {provider} integration.",
    }


# ── Legacy GitHub Endpoints (Maintained for Backward Compatibility) ──


@router.get("/github/status", response_model=IntegrationStatusResponse)
async def get_github_integration_status(
    current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Check if the organization has a GitHub Token configured."""
    org = (
        await db.get(Organization, current_user["org"])
        if current_user.get("org")
        else None
    )
    return IntegrationStatusResponse(
        has_github_token=bool(org and org.github_token_encrypted)
    )


@router.post("/github/token")
@router.post("/github/setup")
@limiter.limit("10/minute")
async def set_github_token(
    request: Request,
    payload: GitHubTokenRequest,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Securely encrypt and store a GitHub Personal Access Token for the organization (admin only)."""
    org = await db.get(Organization, current_user["org"])
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.github_token_encrypted = encrypt(payload.token)
    await db.commit()

    return {"message": "GitHub token securely stored."}


@router.delete("/github/token")
@router.post("/github/remove")
@limiter.limit("10/minute")
async def delete_github_token(
    request: Request,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Remove the GitHub Personal Access Token for the organization (admin only)."""
    org = await db.get(Organization, current_user["org"])
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.github_token_encrypted = None
    await db.commit()

    return {"message": "GitHub token removed."}
