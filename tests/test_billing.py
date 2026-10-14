from unittest.mock import patch

import pytest


@pytest.mark.asyncio
async def test_checkout_session_missing_key(client, auth_headers):
    """Test that checkout returns 500 when Stripe key is missing."""
    with patch("app.routers.billing_routes.settings.STRIPE_SECRET_KEY", None):
        response = await client.post(
            "/billing/checkout", params={"plan": "pro"}, headers=auth_headers
        )
        assert response.status_code == 503
        assert "Billing not configured" in response.json()["detail"]


@pytest.mark.asyncio
async def test_checkout_session_success(client, auth_headers):
    """Test creating a successful checkout session."""
    with (
        patch("stripe.checkout.Session.create") as mock_create,
        patch("app.routers.billing_routes.settings.STRIPE_SECRET_KEY", "test_key"),
    ):
        mock_create.return_value.url = "https://checkout.stripe.com/test_url"
        mock_create.return_value.id = "cs_test_123"

        response = await client.post(
            "/billing/checkout", params={"plan": "pro"}, headers=auth_headers
        )

        assert response.status_code == 200
        assert response.json()["checkout_url"] == "https://checkout.stripe.com/test_url"
        mock_create.assert_called_once()


@pytest.mark.asyncio
async def test_portal_session_missing_key(client, auth_headers):
    """Test portal session when Stripe is not configured."""
    with patch("app.routers.billing_routes.settings.STRIPE_SECRET_KEY", None):
        response = await client.get("/billing/portal", headers=auth_headers)
        assert response.status_code == 503
        assert "Billing not configured" in response.json()["detail"]
