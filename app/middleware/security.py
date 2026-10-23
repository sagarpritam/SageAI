"""Security headers middleware.

Adds OWASP-recommended security headers to all responses.
Implements HSTS, CSP, and other protective headers via pure ASGI.
"""

from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send


class SecurityHeadersMiddleware:
    """Add OWASP security headers to every HTTP response using pure ASGI."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)

                # Prevent clickjacking
                headers["X-Frame-Options"] = "DENY"

                # Prevent MIME sniffing
                headers["X-Content-Type-Options"] = "nosniff"

                # XSS protection (legacy, but still useful)
                headers["X-XSS-Protection"] = "1; mode=block"

                # Referrer policy
                headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

                # Strict transport security (HTTPS only)
                headers["Strict-Transport-Security"] = (
                    "max-age=31536000; includeSubDomains"
                )

                # Content Security Policy
                headers["Content-Security-Policy"] = (
                    "default-src 'self'; "
                    "script-src 'self' 'unsafe-inline'; "
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                    "font-src 'self' https://fonts.gstatic.com; "
                    "img-src 'self' data: https:; "
                    "connect-src 'self' https: wss: ws:;"
                )

                # Permissions policy
                headers["Permissions-Policy"] = (
                    "geolocation=(), microphone=(), camera=(), payment=()"
                )

            await send(message)

        await self.app(scope, receive, send_wrapper)
