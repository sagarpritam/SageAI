import hashlib
import uuid

from fastapi import Request
from slowapi import Limiter

from app.core.config import settings


def get_client_identifier(request: Request) -> str:
    """Resolve a distinct, proxy-aware client identifier for rate limiting.

    1. Internal service-to-service communication with valid internal token is exempted
       by returning a unique random identifier per request.
    2. API keys (X-API-Key) receive isolated per-key buckets.
    3. Authenticated JWTs (Authorization: Bearer ...) receive isolated per-token buckets,
       preventing different users behind a single corporate NAT/Cloud Run proxy from
       starving each other.
    4. Real Client IP is extracted from X-Forwarded-For or X-Real-IP headers when running
       behind Cloud Run, Next.js, or cloud load balancers.
    5. Direct client IP fallback.
    """
    # 1. Exempt internal microservices
    internal_header = request.headers.get("x-internal-service", "")
    token = internal_header.replace("Bearer ", "").strip()
    if token and settings.INTERNAL_SERVICE_KEY:
        try:
            from jose import jwt as jose_jwt

            payload = jose_jwt.decode(
                token, settings.INTERNAL_SERVICE_KEY, algorithms=["HS256"]
            )
            if payload.get("type") == "internal_service":
                return f"internal:{uuid.uuid4().hex}"
        except Exception:
            pass

    # 2. API key bucket
    api_key = request.headers.get("x-api-key")
    if api_key:
        hashed_key = hashlib.sha256(api_key.encode()).hexdigest()[:16]
        return f"apikey:{hashed_key}"

    # 3. Authenticated Bearer JWT bucket
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        if token:
            hashed_token = hashlib.sha256(token.encode()).hexdigest()[:16]
            return f"auth:{hashed_token}"

    # 4. Proxy-aware Client IP (Cloud Run / Next.js proxy)
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
        if client_ip:
            return f"ip:{client_ip}"

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return f"ip:{real_ip.strip()}"

    # 5. Direct client host fallback
    if request.client and request.client.host:
        return f"ip:{request.client.host}"

    return "ip:127.0.0.1"


limiter = Limiter(
    key_func=get_client_identifier,
    default_limits=[lambda: settings.RATE_LIMIT],
)
