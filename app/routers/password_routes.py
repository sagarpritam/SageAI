"""Password reset routes — request + confirm reset via token."""

import secrets
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.services.email_service import email_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory token store (use Redis in production)
_reset_tokens: dict[str, dict] = {}


@router.post("/forgot-password")
async def forgot_password(email: str, db: AsyncSession = Depends(get_db)):
    """Send a password reset link to the user's email."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If that email exists, a reset link has been sent"}

    # Generate reset token
    token = secrets.token_urlsafe(32)
    _reset_tokens[token] = {
        "user_id": user.id,
        "expires": datetime.now(timezone.utc) + timedelta(hours=1),
    }

    # Send email
    import os
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    email_service.send_password_reset(email, reset_link)

    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using a valid reset token."""
    token_data = _reset_tokens.get(token)

    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if datetime.now(timezone.utc) > token_data["expires"]:
        _reset_tokens.pop(token, None)
        raise HTTPException(status_code=400, detail="Reset token has expired")

    result = await db.execute(select(User).where(User.id == token_data["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(new_password)
    await db.commit()

    # Invalidate token
    _reset_tokens.pop(token, None)

    return {"message": "Password reset successfully"}
