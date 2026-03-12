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
    environments (development, test) the default behaviour of httpx is used.
    """
    env = os.getenv("ENV", "development").lower()
    # ``verify`` is *True* for production, otherwise we keep the default (True)
    verify = env != "production"
    return httpx.AsyncClient(
        timeout=timeout,
        verify=verify,
        follow_redirects=follow_redirects,
    )
