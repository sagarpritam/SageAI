"""GDPR-compliant audit logging middleware.

Logs all API access with user context for compliance audit trails.
Follows GDPR Article 30 requirements for processing records.
"""

import logging
import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("SageAI.audit")


class AuditLogMiddleware(BaseHTTPMiddleware):
    """Middleware that creates audit log entries for every request."""

    # Paths that don't need audit logging
    SKIP_PATHS = {"/", "/docs", "/openapi.json", "/redoc", "/favicon.ico"}

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)

        request_id = str(uuid.uuid4())[:8]
        start_time = time.time()

        # Extract user context from JWT (if present)
        user_id = "anonymous"
        org_id = "unknown"
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                from app.core.security import verify_token
                payload = verify_token(auth_header.split(" ")[1])
                user_id = payload.get("sub", "unknown")
                org_id = payload.get("org", "unknown")
            except Exception:
                pass

        response = await call_next(request)
        duration_ms = round((time.time() - start_time) * 1000, 2)

        # Create structured audit entry
        logger.info(
            "api_access",
            extra={
                "request_id": request_id,
                "user_id": user_id,
                "org_id": org_id,
                "ip": request.client.host if request.client else "unknown",
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )

        # Add request ID to response headers for tracing
        response.headers["X-Request-ID"] = request_id
        return response
