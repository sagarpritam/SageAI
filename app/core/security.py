"""Authentication & authorization primitives.

Provides:
- Password hashing (pbkdf2)
- JWT access tokens with issuer/audience validation
- Short-lived service JWTs for internal Next.js → FastAPI proxy calls
- IP-allowlisted internal service authentication
- Role-based access control with hierarchy
"""

import ipaddress
import logging
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

logger = logging.getLogger("SageAI.security")

# ---------------------
# Constants
# ---------------------
JWT_ISSUER = "sageai-api"
JWT_AUDIENCE = "sageai-platform"
SERVICE_JWT_ISSUER = "sageai-frontend"
SERVICE_JWT_AUDIENCE = "sageai-api-internal"
SERVICE_TOKEN_MAX_AGE_SECONDS = 60  # Service tokens expire in 60 seconds

# Role hierarchy: higher index = more privilege
ROLE_HIERARCHY = {
    "viewer": 0,
    "member": 1,
    "manager": 2,
    "admin": 3,
}

# Default allowed IPs for internal services (loopback + Docker bridge)
DEFAULT_INTERNAL_IPS = [
    "127.0.0.1",
    "::1",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
]

# ---------------------
# Password Hashing
# ---------------------
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ---------------------
# IP Allowlisting
# ---------------------
def _parse_allowed_networks() -> list[ipaddress.IPv4Network | ipaddress.IPv6Network]:
    """Parse INTERNAL_ALLOWED_IPS setting into network objects.

    Accepts comma-separated IPs or CIDR ranges from the config.
    Falls back to DEFAULT_INTERNAL_IPS (loopback + private ranges).
    """
    raw = getattr(settings, "INTERNAL_ALLOWED_IPS", "")
    entries = (
        [e.strip() for e in raw.split(",") if e.strip()]
        if raw
        else DEFAULT_INTERNAL_IPS
    )

    networks = []
    for entry in entries:
        try:
            networks.append(ipaddress.ip_network(entry, strict=False))
        except ValueError:
            logger.warning("Invalid IP/CIDR in INTERNAL_ALLOWED_IPS: %s", entry)
    return networks


# Pre-parse at module load
_ALLOWED_NETWORKS = _parse_allowed_networks()


def is_ip_allowed(client_ip: str) -> bool:
    """Check if a client IP is in the internal service allowlist."""
    try:
        addr = ipaddress.ip_address(client_ip)
        return any(addr in network for network in _ALLOWED_NETWORKS)
    except ValueError:
        logger.warning("Could not parse client IP: %s", client_ip)
        return False


# ---------------------
# JWT Token Operations
# ---------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token with issuer, audience, and expiry."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update(
        {
            "exp": expire,
            "iss": JWT_ISSUER,
            "aud": JWT_AUDIENCE,
            "iat": datetime.now(timezone.utc),
        }
    )
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_service_token(user_id: str, org_id: str, role: str = "member") -> str:
    """Create a short-lived JWT for internal service-to-service calls.

    This token is signed with INTERNAL_SERVICE_KEY (a shared secret between
    Next.js and FastAPI), scoped to a specific user and org, and expires
    in SERVICE_TOKEN_MAX_AGE_SECONDS (default 60s).

    The Next.js frontend should call this to mint a token that proxies
    the real user identity to the FastAPI backend.
    """
    if not settings.INTERNAL_SERVICE_KEY:
        raise ValueError("INTERNAL_SERVICE_KEY is required to mint service tokens")

    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "org": org_id,
        "role": role,
        "iss": SERVICE_JWT_ISSUER,
        "aud": SERVICE_JWT_AUDIENCE,
        "iat": now,
        "exp": now + timedelta(seconds=SERVICE_TOKEN_MAX_AGE_SECONDS),
        "type": "service",
    }
    return jwt.encode(payload, settings.INTERNAL_SERVICE_KEY, algorithm="HS256")


def _verify_service_token(token: str) -> dict | None:
    """Verify a short-lived service JWT signed by the frontend.

    Returns the decoded payload if valid, or None if invalid/expired.
    """
    if not settings.INTERNAL_SERVICE_KEY:
        return None

    try:
        payload = jwt.decode(
            token,
            settings.INTERNAL_SERVICE_KEY,
            algorithms=["HS256"],
            audience=SERVICE_JWT_AUDIENCE,
            issuer=SERVICE_JWT_ISSUER,
        )

        # Enforce that service tokens carry real user/org context
        if not payload.get("sub") or not payload.get("org"):
            logger.warning("Service token missing sub or org claims")
            return None

        # Enforce max age (belt-and-suspenders; jose checks exp too)
        iat = payload.get("iat")
        if iat:
            issued_at = datetime.fromtimestamp(iat, tz=timezone.utc)
            age = (datetime.now(timezone.utc) - issued_at).total_seconds()
            if age > SERVICE_TOKEN_MAX_AGE_SECONDS:
                logger.warning(
                    "Service token too old: %ds (max %ds)",
                    age,
                    SERVICE_TOKEN_MAX_AGE_SECONDS,
                )
                return None

        return payload
    except JWTError as e:
        logger.debug("Service token verification failed: %s", e)
        return None


# ---------------------
# Main Auth Dependency
# ---------------------
async def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """FastAPI dependency — decode JWT, API Key, or Service token and return the payload.

    Supports three authentication flows:
    0. API Key (X-API-Key header or Bearer sageai_...)
    1. Standard user JWT (signed with SECRET_KEY, iss=sageai-api)
    2. Internal service JWT (signed with INTERNAL_SERVICE_KEY, iss=sageai-frontend)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # --- Flow 0: Check API Key (X-API-Key header or Bearer sageai_...) ---
    api_key_candidate = request.headers.get("x-api-key")
    if not api_key_candidate and token and token.startswith("sageai_"):
        api_key_candidate = token

    if api_key_candidate:
        from sqlalchemy import select

        from app.models.api_key import APIKey

        res = await db.execute(
            select(APIKey).where(
                APIKey.key == api_key_candidate,
                APIKey.is_active == True,  # noqa: E712
            )
        )
        key_record = res.scalar_one_or_none()
        if not key_record:
            raise credentials_exception

        key_record.last_used_at = datetime.now(timezone.utc)
        await db.commit()
        return {
            "sub": key_record.created_by,
            "org": key_record.organization_id,
            "role": "admin",
            "_auth_type": "api_key",
        }

    if not token:
        raise credentials_exception

    # --- Flow 2: Check if this is an internal service token ---
    # Only attempt service token verification if:
    #   a) INTERNAL_SERVICE_KEY is configured
    #   b) The request originates from an allowlisted IP
    if settings.INTERNAL_SERVICE_KEY:
        client_ip = request.client.host if request.client else "unknown"

        if is_ip_allowed(client_ip):
            service_payload = _verify_service_token(token)
            if service_payload is not None:
                logger.info(
                    "Service token auth: user=%s org=%s from=%s",
                    service_payload.get("sub"),
                    service_payload.get("org"),
                    client_ip,
                )
                return {
                    "sub": service_payload["sub"],
                    "org": service_payload["org"],
                    "role": service_payload.get("role", "member"),
                    "_auth_type": "service",
                }

    # --- Flow 1: Standard user JWT ---
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            audience=JWT_AUDIENCE,
            issuer=JWT_ISSUER,
            options={
                # Allow tokens created before we added iss/aud for backward compat
                "verify_aud": True,
                "verify_iss": True,
            },
        )
        if payload.get("sub") is None:
            raise credentials_exception
        payload["_auth_type"] = "user"
        return payload
    except JWTError:
        # Fallback: try decoding without iss/aud for tokens issued before this change
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
                options={"verify_aud": False, "verify_iss": False},
            )
            if payload.get("sub") is None:
                raise credentials_exception
            logger.warning(
                "Legacy JWT accepted (no iss/aud) for user=%s — client should refresh token",
                payload.get("sub"),
            )
            payload["_auth_type"] = "user_legacy"
            return payload
        except JWTError:
            raise credentials_exception


# ---------------------
# Role-based Access
# ---------------------
def require_role(required_role: str):
    """FastAPI dependency factory — ensure the user has at least the required role.

    Uses role hierarchy: admin > manager > member > viewer.
    An admin can access endpoints that require 'member' or 'viewer'.
    """
    required_level = ROLE_HIERARCHY.get(required_role, 0)

    async def role_checker(
        request: Request,
        current_user: dict = Depends(get_current_user),
    ):
        user_role = current_user.get("role", "viewer")
        user_level = ROLE_HIERARCHY.get(user_role, 0)

        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires '{required_role}' role or higher",
            )
        return current_user

    return role_checker
