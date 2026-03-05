"""API Key management routes."""

import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import require_role
from app.models.api_key import APIKey

router = APIRouter(prefix="/api-keys", tags=["API Keys"])


@router.post("")
async def create_api_key(
    name: str,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Create a new API key (admin only). The key is shown only once."""
    raw_key = f"sageai_{secrets.token_urlsafe(32)}"

    api_key = APIKey(
        key=raw_key,
        name=name,
        organization_id=current_user["org"],
        created_by=current_user["sub"],
    )
    db.add(api_key)
    await db.commit()

    return {
        "id": api_key.id,
        "name": name,
        "key": raw_key,
        "message": "Save this key — it won't be shown again.",
    }


@router.get("")
async def list_api_keys(
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """List all API keys for the organization (admin only)."""
    result = await db.execute(
        select(APIKey).where(APIKey.organization_id == current_user["org"])
    )
    keys = result.scalars().all()

    return [
        {
            "id": k.id,
            "name": k.name,
            "key_preview": k.key[:10] + "...",
            "is_active": k.is_active,
            "last_used_at": k.last_used_at,
            "created_at": k.created_at,
        }
        for k in keys
    ]


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Revoke an API key (admin only)."""
    result = await db.execute(
        select(APIKey).where(APIKey.id == key_id, APIKey.organization_id == current_user["org"])
    )
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")

    key.is_active = False
    await db.commit()

    return {"message": "API key revoked", "id": key_id}
