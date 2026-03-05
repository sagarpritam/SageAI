"""MFA (Multi-Factor Authentication) routes.

Provides TOTP setup, QR code generation, verification, and backup codes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.mfa_service import (
    generate_totp_secret, get_totp_uri, generate_qr_code,
    verify_totp, generate_backup_codes,
)

router = APIRouter(prefix="/auth/mfa", tags=["Multi-Factor Auth"])


@router.post("/setup")
async def setup_mfa(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate TOTP secret and QR code for authenticator app setup."""
    result = await db.execute(select(User).where(User.id == current_user["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate new secret
    secret = generate_totp_secret()
    uri = get_totp_uri(secret, user.email)
    qr_code = generate_qr_code(uri)
    backup_codes = generate_backup_codes()

    # Store secret and backup codes (in production, encrypt these)
    user.mfa_secret = secret
    user.mfa_backup_codes = ",".join(backup_codes)
    user.mfa_enabled = False  # Not active until verified
    await db.commit()

    return {
        "secret": secret,
        "qr_code": qr_code,
        "backup_codes": backup_codes,
        "message": "Scan the QR code with your authenticator app, then verify with /auth/mfa/verify",
    }


@router.post("/verify")
async def verify_mfa(
    code: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify TOTP code and activate MFA."""
    result = await db.execute(select(User).where(User.id == current_user["sub"]))
    user = result.scalar_one_or_none()
    if not user or not user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA not set up — call /auth/mfa/setup first")

    if not verify_totp(user.mfa_secret, code):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")

    user.mfa_enabled = True
    await db.commit()

    return {"message": "MFA activated successfully", "mfa_enabled": True}


@router.post("/disable")
async def disable_mfa(
    code: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Disable MFA (requires valid TOTP code)."""
    result = await db.execute(select(User).where(User.id == current_user["sub"]))
    user = result.scalar_one_or_none()
    if not user or not user.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA is not enabled")

    if not verify_totp(user.mfa_secret, code):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")

    user.mfa_enabled = False
    user.mfa_secret = None
    user.mfa_backup_codes = None
    await db.commit()

    return {"message": "MFA disabled", "mfa_enabled": False}
