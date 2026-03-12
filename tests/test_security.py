import pytest
from app.utils.http_client import get_http_client

@pytest.mark.parametrize("env,expected_verify", [
    ("production", True),
    ("development", True),   # default behaviour – verification stays on
    ("test", True),
])
def test_http_client_verify_flag(env, expected_verify, monkeypatch):
    """
    The helper must never disable certificate verification in production.
    """
    monkeypatch.setenv("ENV", env)
    client = get_http_client()
    assert client.verify == expected_verify
    # Close the client cleanly to avoid resource warnings
    client.aclose()
