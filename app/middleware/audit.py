"""GDPR-compliant audit logging middleware.

Logs all API access with user context for compliance audit trails.
Follows GDPR Article 30 requirements for processing records.
Pure ASGI implementation for maximum performance.
"""

import logging
import time
import uuid

from starlette.datastructures import Headers, MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

logger = logging.getLogger("SageAI.audit")


class AuditLogMiddleware:
    """Pure ASGI middleware that creates audit log entries for every request."""

    # Paths that don't need audit logging
    SKIP_PATHS = {"/", "/docs", "/openapi.json", "/redoc", "/favicon.ico"}

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        if path in self.SKIP_PATHS:
            await self.app(scope, receive, send)
            return

        request_id = str(uuid.uuid4())[:8]
        start_time = time.time()

        # Extract user context from JWT (if present)
        user_id = "anonymous"
        org_id = "unknown"
        headers = Headers(scope=scope)
        auth_header = headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                import jwt

                from app.core.config import settings

                token = auth_header.split(" ", 1)[1]
                payload = None
                try:
                    payload = jwt.decode(
                        token,
                        settings.SECRET_KEY,
                        algorithms=[settings.ALGORITHM],
                        options={
                            "verify_aud": False,
                            "verify_iss": False,
                            "verify_exp": False,
                        },
                    )
                except Exception:
                    if getattr(settings, "INTERNAL_SERVICE_KEY", None):
                        try:
                            payload = jwt.decode(
                                token,
                                settings.INTERNAL_SERVICE_KEY,
                                algorithms=["HS256"],
                                options={
                                    "verify_aud": False,
                                    "verify_iss": False,
                                    "verify_exp": False,
                                },
                            )
                        except Exception:
                            payload = None

                if payload:
                    user_id = payload.get("sub", "unknown")
                    org_id = payload.get("org", "unknown")
            except Exception:
                pass

        status_code = 500

        async def send_wrapper(message: Message) -> None:
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message.get("status", 200)
                res_headers = MutableHeaders(scope=message)
                res_headers["X-Request-ID"] = request_id
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            client = scope.get("client")
            ip = client[0] if client else "unknown"

            # Create structured audit entry
            logger.info(
                "api_access",
                extra={
                    "request_id": request_id,
                    "user_id": user_id,
                    "org_id": org_id,
                    "ip": ip,
                    "method": scope.get("method", "UNKNOWN"),
                    "path": path,
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                },
            )
