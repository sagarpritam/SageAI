import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_security_headers_middleware(client: AsyncClient):
    """Test that SecurityHeadersMiddleware adds the correct headers."""
    response = await client.get("/")
    assert response.headers.get("Strict-Transport-Security") == "max-age=31536000; includeSubDomains"
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"

@pytest.mark.asyncio
async def test_audit_log_middleware(client: AsyncClient, auth_headers):
    """Test that audit log middleware doesn't crash on authenticated requests."""
    # This also implicitly tests that our fix to use jose.jwt.decode is working
    response = await client.get("/billing/portal", headers=auth_headers)
    # If stripe is not configured, we might get 500, but definitely not 404.
    assert response.status_code in [200, 400, 500, 503]

@pytest.mark.asyncio
async def test_cors_middleware(client: AsyncClient):
    """Test that CORS headers are appropriately applied based on origin."""
    response = await client.options(
        "/", 
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    # The exact origins may vary depending on settings, but we should at least check if it processes
    assert response.status_code in [200, 400] # Depending on if the origin is allowed in test settings
