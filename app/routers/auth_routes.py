from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import (
    create_access_token,
    hash_password,
    needs_rehash,
    verify_password,
)
from app.models.organization import Organization
from app.models.user import User
from app.schemas.auth import TokenResponse, UserCreate, UserLogin
from app.services.mfa_service import verify_totp

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
@limiter.limit("60/minute")
async def register(
    request: Request, payload: UserCreate, db: AsyncSession = Depends(get_db)
):
    """Register a new user and organization."""

    # Check if email already exists
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    # Create organization
    org = Organization(name=payload.organization_name)
    db.add(org)
    await db.flush()  # get org.id before creating user

    # Create user
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        organization_id=org.id,
        role="admin",  # First user in an org is admin
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate JWT
    token = create_access_token(
        {
            "sub": user.id,
            "email": user.email,
            "org": user.organization_id,
            "role": user.role,
        }
    )

    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("30/minute")
async def login(
    request: Request, payload: UserLogin, db: AsyncSession = Depends(get_db)
):
    """Authenticate and return a JWT token."""

    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Automatically upgrade legacy or lower-work-factor hashes to modern OWASP standard
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(payload.password)
        await db.commit()

    if user.mfa_enabled:
        if not payload.mfa_code:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="mfa_required",
            )
        if not user.mfa_secret or not verify_totp(user.mfa_secret, payload.mfa_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid MFA code",
            )

    token = create_access_token(
        {
            "sub": user.id,
            "email": user.email,
            "org": user.organization_id,
            "role": user.role,
        }
    )

    return TokenResponse(access_token=token)
