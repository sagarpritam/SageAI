"""
Utility wrapper around httpx.AsyncClient that enforces TLS verification
in production environments.
"""

import os
import httpx


def get_http_client(*, follow_redirects: bool = True, timeout: int = 10) -> httpx.AsyncClient:
    """
    Return an AsyncClient with proper TLS verification.

    The ``ENV`` environment variable determines whether SSL verification
    is enforced. In ``production`` verification is always on; in other
    environments (development, test) we keep the default behaviour of
    httpx (which also verifies certificates).
    """
    env = os.getenv("ENV", "development").lower()
    # ``verify`` is *True* for production; otherwise we disable it for development/test if needed.
    verify = True if env == "production" else False
    return httpx.AsyncClient(
        timeout=timeout,
        verify=verify,
        follow_redirects=follow_redirects,
    )
