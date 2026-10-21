"""Password reset routes — request + confirm reset via token."""

import json
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    validate_password_complexity,
)
from app.schemas.responses import MessageResponse
from app.services.email_service import email_service

logger = logging.getLogger("SageAI.auth.password")
router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory token store (fallback when Redis is not available)
_reset_tokens: dict[str, dict] = {}


async def _save_reset_token(token: str, user_id: str, ttl_seconds: int = 3600) -> None:
    """Store reset token in Redis if available, otherwise in local memory."""
    try:
        import redis.asyncio as aioredis

        client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await client.setex(
            f"reset_token:{token}",
            ttl_seconds,
            json.dumps(
                {
                    "user_id": user_id,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            ),
        )
        await client.aclose()
        return
    except Exception as e:
        logger.debug("Redis unavailable for reset token storage, using memory: %s", e)

    _reset_tokens[token] = {
        "user_id": user_id,
        "expires": datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds),
    }


async def _consume_reset_token(token: str) -> str | None:
    """Validate and consume (delete) a reset token. Returns user_id if valid, else None."""
    # 1. Try Redis
    try:
        import redis.asyncio as aioredis

        client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        val = await client.get(f"reset_token:{token}")
        if val:
            await client.delete(f"reset_token:{token}")
            await client.aclose()
            data = json.loads(val)
            return data.get("user_id")
        await client.aclose()
    except Exception as e:
        logger.debug("Redis unavailable during reset token check: %s", e)

    # 2. Check in-memory store
    token_data = _reset_tokens.pop(token, None)
    if not token_data:
        return None

    if datetime.now(timezone.utc) > token_data["expires"]:
        return None

    return token_data.get("user_id")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    body: ForgotPasswordRequest | None = None,
    email: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Send a password reset link to the user's email.

    Accepts JSON body `{"email": "user@example.com"}` or query param for compatibility.
    """
    target_email = body.email if body else email
    if not target_email:
        raise HTTPException(status_code=400, detail="Email is required")

    result = await db.execute(select(User).where(User.email == target_email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration (OWASP ASVS 2.1.7)
    if not user:
        return {"message": "If that email exists, a reset link has been sent"}

    # Generate cryptographically secure reset token
    token = secrets.token_urlsafe(32)
    await _save_reset_token(token, user.id, ttl_seconds=3600)

    # Send reset email
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    email_service.send_password_reset(target_email, reset_link)

    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    body: ResetPasswordRequest | None = None,
    token: str | None = None,
    new_password: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using a valid reset token.

    Accepts secure JSON body `{"token": "...", "new_password": "..."}` or query params for compatibility.
    """
    reset_token = body.token if body else token
    plain_password = body.new_password if body else new_password

    if not reset_token or not plain_password:
        raise HTTPException(
            status_code=400, detail="Token and new password are required"
        )

    # Validate password complexity
    try:
        validate_password_complexity(plain_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user_id = await _consume_reset_token(reset_token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(plain_password)
    await db.commit()

    return {"message": "Password reset successfully"}
