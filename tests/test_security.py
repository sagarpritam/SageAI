import pytest
from app.utils.http_client import get_http_client

from unittest.mock import patch

@pytest.mark.parametrize("env,expected_verify", [
    ("production", True),
    ("development", True),
    ("test", True),
])
def test_http_client_verification(monkeypatch, env, expected_verify):
    monkeypatch.setenv("ENV", env)
    with patch("app.utils.http_client.httpx.AsyncClient") as mock_client:
        get_http_client()
        mock_client.assert_called_once()
        _, kwargs = mock_client.call_args
        assert kwargs.get("verify") is expected_verify
