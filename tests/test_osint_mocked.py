import pytest
from pytest_httpx import HTTPXMock

from app.services.intelligence.osint_industries_intel import (
    osint_industries_lookup,
)


@pytest.mark.asyncio
async def test_osint_industries_free_email_mocked(httpx_mock: HTTPXMock):
    """
    Tests the free OSINT reconnaissance pipeline without making actual network requests.
    Mocks the Gravatar and GitHub API responses.
    """
    email = "test@example.com"
    email_hash = "55502f40dc8b7c769880b10874abc9d0"  # MD5 of test@example.com

    # Mock Gravatar Response
    httpx_mock.add_response(
        url=f"https://en.gravatar.com/{email_hash}.json",
        json={
            "entry": [
                {
                    "displayName": "Test User",
                    "aboutMe": "Security Researcher",
                    "urls": [{"value": "https://example.com/blog"}],
                }
            ]
        },
        status_code=200,
    )

    # Mock GitHub Response
    httpx_mock.add_response(
        url=f"https://api.github.com/search/users?q={email}+in:email",
        json={
            "total_count": 1,
            "items": [{"login": "testuser_github"}],
        },
        status_code=200,
    )

    # Run the service (which uses httpx internally)
    findings = await osint_industries_lookup(target=email, target_type="email")

    # Verify results
    assert len(findings) > 0

    # Find specific mocked results
    gravatar_finding = next(
        (f for f in findings if f["type"] == "gravatar_profile"), None
    )
    assert gravatar_finding is not None
    assert gravatar_finding["data"]["display_name"] == "Test User"

    github_finding = next((f for f in findings if f["type"] == "github_account"), None)
    assert github_finding is not None
    assert "testuser_github" in github_finding["data"]["github_users"]


@pytest.mark.asyncio
async def test_osint_industries_api_mocked(httpx_mock: HTTPXMock, monkeypatch):
    """
    Tests the Pro OSINT Industries API pipeline using a mocked API key and response.
    """
    monkeypatch.setenv("OSINT_INDUSTRIES_API_KEY", "mock_key_123")
    target = "test@example.com"

    # Mock OSINT Industries API
    httpx_mock.add_response(
        url=f"https://api.osint.industries/v2/email/{target}",
        json={
            "modules": [
                {
                    "module": "linkedin",
                    "data": {"exists": True, "profile_id": "12345"},
                }
            ]
        },
        status_code=200,
    )

    findings = await osint_industries_lookup(target=target, target_type="email")

    assert len(findings) == 1
    assert findings[0]["type"] == "platform_linkedin"
    assert findings[0]["data"]["exists"] is True
