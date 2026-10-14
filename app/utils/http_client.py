"""
Utility wrapper around httpx.AsyncClient that enforces TLS verification.

SSL certificate verification is ALWAYS enabled to prevent man-in-the-middle attacks.
"""

import httpx


def get_http_client(
    *, follow_redirects: bool = True, timeout: int = 10
) -> httpx.AsyncClient:
    """
    Return an AsyncClient with proper TLS verification enabled.

    SSL verification is always enabled regardless of environment to ensure
    secure connections and prevent man-in-the-middle attacks.
    """
    return httpx.AsyncClient(
        timeout=timeout,
        verify=True,  # Always verify SSL certificates
        follow_redirects=follow_redirects,
    )
