from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_get_all_integrations_status(client, auth_headers):
    """Test retrieving consolidated status of all integrations."""
    resp = await client.get("/integrations/all/status", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "nvidia" in data
    assert "censys" in data
    assert "shodan" in data
    assert "virustotal" in data
    assert "github" in data
    assert data["nvidia"]["model"] == "meta/llama-3.3-70b-instruct"


@pytest.mark.asyncio
async def test_verify_nvidia_key_success(client, auth_headers):
    """Test successful verification of an NVIDIA NIM key."""
    with patch(
        "app.routers.integration_routes.verify_nvidia_key",
        new_callable=AsyncMock,
    ) as mock_verify:
        mock_verify.return_value = {
            "valid": True,
            "provider": "nvidia",
            "message": "NVIDIA NIM verified: Meta Llama 3.3 70B active",
            "model": "meta/llama-3.3-70b-instruct",
            "latency_ms": 120,
        }

        resp = await client.post(
            "/integrations/verify",
            json={"provider": "nvidia", "key": "nvapi-test-key"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["valid"] is True
        assert data["provider"] == "nvidia"
        assert "Meta Llama 3.3 70B" in data["message"]


@pytest.mark.asyncio
async def test_verify_censys_credentials_failure(client, auth_headers):
    """Test failed verification of Censys credentials."""
    with patch(
        "app.routers.integration_routes.verify_censys_credentials",
        new_callable=AsyncMock,
    ) as mock_verify:
        mock_verify.return_value = {
            "valid": False,
            "provider": "censys",
            "error": "Invalid Censys API ID or Secret.",
        }

        resp = await client.post(
            "/integrations/verify",
            json={
                "provider": "censys",
                "key": "invalid-id",
                "secondary_key": "invalid-secret",
            },
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["valid"] is False
        assert "Invalid Censys" in data["error"]


@pytest.mark.asyncio
async def test_save_integration_success(client, auth_headers):
    """Test verifying and saving a valid integration key."""
    with (
        patch(
            "app.routers.integration_routes.verify_nvidia_key",
            new_callable=AsyncMock,
        ) as mock_verify,
        patch("app.routers.integration_routes.update_env_file") as mock_update_env,
    ):
        mock_verify.return_value = {"valid": True}
        mock_update_env.return_value = True

        resp = await client.post(
            "/integrations/save",
            json={"provider": "nvidia", "key": "nvapi-real-key"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        mock_update_env.assert_called_once_with({"NVIDIA_API_KEY": "nvapi-real-key"})
