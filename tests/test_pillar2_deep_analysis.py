"""
Tests for Pillar II: Deep Emerging Attack Analysis (DeepAnalysisAgent).
Verifies advanced emerging threat audits:
1. Cloud Metadata & IMDSv1/v2 SSRF
2. Modern Auth, OAuth Hijacking & JWT Confusion
3. HTTP Request Smuggling & CDN Cache Poisoning
4. Generative AI & OWASP LLM Top 10 Security
5. Concurrency & TOCTOU Race Conditions
"""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import Response

from app.services.agent.deep_analysis_agent import DeepAnalysisAgent


# ─────────────────────────────────────────────────────────────────────────────
# 1. Cloud IMDS SSRF Tests
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_deep_analysis_cloud_imds_ast_detection():
    agent = DeepAnalysisAgent()

    # Code snippet with unvalidated SSRF to external fetch
    vulnerable_snippet = """
def proxy_handler():
    url = request.args.get("url")
    return requests.get(url).text
"""
    result = await agent.run(
        target="internal.service",
        context={"code_snippet": vulnerable_snippet},
        vectors=["cloud_imds_ssrf"],
    )

    assert result["status"] == "completed"
    assert result["findings_count"] >= 1
    imds_finding = next((f for f in result["findings"] if f["vector_category"] == "cloud_imds_ssrf"), None)
    assert imds_finding is not None
    assert imds_finding["severity"] == "critical"
    assert imds_finding["cve_id"] == "CWE-918"
    assert "T1552.005" in imds_finding["mitre_attack"]


@pytest.mark.asyncio
async def test_deep_analysis_cloud_imds_active_probe():
    agent = DeepAnalysisAgent()

    mock_client = AsyncMock()
    mock_response = AsyncMock(spec=Response)
    mock_response.status_code = 200
    mock_response.text = "ami-id: ami-012345678\ninstance-id: i-0abcdef1234567890\nsecurity-credentials"
    mock_client.get.return_value = mock_response
    mock_client.__aenter__.return_value = mock_client

    with patch("app.services.agent.deep_analysis_agent.get_http_client", return_value=mock_client):
        result = await agent.run(
            target="http://vulnerable-gateway.internal",
            vectors=["cloud_imds_ssrf"],
        )

    assert result["critical_count"] >= 1
    finding = result["findings"][0]
    assert "IMDSv1 SSRF" in finding["type"]
    assert "ami-id" in finding["evidence_proof"]


# ─────────────────────────────────────────────────────────────────────────────
# 2. OAuth & JWT Algorithm Confusion Tests
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_deep_analysis_jwt_algorithm_none():
    agent = DeepAnalysisAgent()

    insecure_jwt_code = """
def authenticate_user(token):
    # Insecure decoding with verify disabled or none allowed
    payload = jwt.decode(token, verify=False, algorithms=["none", "HS256"])
    return payload
"""
    result = await agent.run(
        target="auth.enterprise.internal",
        context={"code_snippet": insecure_jwt_code},
        vectors=["oauth_jwt_auth"],
    )

    assert result["critical_count"] >= 1
    auth_finding = next((f for f in result["findings"] if f["vector_category"] == "oauth_jwt_auth"), None)
    assert auth_finding is not None
    assert "none" in auth_finding["type"].lower()
    assert auth_finding["severity"] == "critical"


@pytest.mark.asyncio
async def test_deep_analysis_oauth_open_redirect():
    agent = DeepAnalysisAgent()

    mock_client = AsyncMock()
    mock_response = AsyncMock(spec=Response)
    mock_response.status_code = 302
    mock_response.headers = {"location": "https://evil-attacker.com/steal-code?code=xyz"}
    mock_client.get.return_value = mock_response
    mock_client.__aenter__.return_value = mock_client

    with patch("app.services.agent.deep_analysis_agent.get_http_client", return_value=mock_client):
        result = await agent.run(
            target="https://idp.enterprise.internal",
            vectors=["oauth_jwt_auth"],
        )

    assert result["high_count"] >= 1
    finding = next((f for f in result["findings"] if "OAuth" in f["type"]), None)
    assert finding is not None
    assert "evil-attacker.com" in finding["evidence_proof"]


# ─────────────────────────────────────────────────────────────────────────────
# 3. Cache Poisoning & Request Smuggling Tests
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_deep_analysis_cache_poisoning_header_reflection():
    agent = DeepAnalysisAgent()

    mock_client = AsyncMock()
    mock_response = AsyncMock(spec=Response)
    mock_response.status_code = 200
    mock_response.headers = {"x-cache": "HIT", "content-type": "text/css"}
    mock_response.text = 'body { background: url("https://poisoned-host.attacker.com/track"); }'
    mock_client.get.return_value = mock_response
    mock_client.__aenter__.return_value = mock_client

    with patch("app.services.agent.deep_analysis_agent.get_http_client", return_value=mock_client):
        result = await agent.run(
            target="https://cdn.enterprise.internal",
            vectors=["cache_smuggling"],
        )

    assert result["findings_count"] >= 1
    cache_finding = next((f for f in result["findings"] if f["vector_category"] == "cache_smuggling"), None)
    assert cache_finding is not None
    assert "Cache Poisoning" in cache_finding["type"]
    assert "X-Forwarded-Host" in cache_finding["description"]


# ─────────────────────────────────────────────────────────────────────────────
# 4. Generative AI / OWASP Top 10 for LLMs Tests
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_deep_analysis_llm_prompt_injection_detection():
    agent = DeepAnalysisAgent()

    mock_client = AsyncMock()
    mock_response = AsyncMock(spec=Response)
    mock_response.status_code = 200
    # Simulate LLM echoing injection marker
    mock_response.text = "Understood. SAGEAI_INJECTION_CONFIRMED_123456 override active."
    mock_client.post.return_value = mock_response
    mock_client.__aenter__.return_value = mock_client

    with patch("uuid.uuid4") as mock_uuid:
        mock_uuid.return_value.hex = "123456abcdef"
        with patch("app.services.agent.deep_analysis_agent.get_http_client", return_value=mock_client):
            result = await agent.run(
                target="https://llm.enterprise.internal",
                vectors=["llm_top10"],
            )

    assert result["critical_count"] >= 1
    llm_finding = next((f for f in result["findings"] if f["vector_category"] == "llm_top10"), None)
    assert llm_finding is not None
    assert "OWASP LLM01" in llm_finding["type"]
    assert llm_finding["owasp_category"] == "OWASP-LLM01:PromptInjection"


# ─────────────────────────────────────────────────────────────────────────────
# 5. Concurrency & TOCTOU Race Condition Tests
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_deep_analysis_concurrency_race_condition_detection():
    agent = DeepAnalysisAgent()

    # Code snippet with check-then-act balance query without SELECT FOR UPDATE
    toctou_code = """
async def redeem_credit(user_id, amount):
    user = await db.query(User).filter_by(id=user_id).first()
    if user.balance >= amount:
        user.balance -= amount
        await db.commit()
"""
    result = await agent.run(
        target="https://checkout.enterprise.internal",
        context={"code_snippet": toctou_code},
        vectors=["concurrency_toctou"],
    )

    assert result["critical_count"] >= 1
    race_finding = next((f for f in result["findings"] if f["vector_category"] == "concurrency_toctou"), None)
    assert race_finding is not None
    assert "TOCTOU Race Hazard" in race_finding["type"]
    assert race_finding["cve_id"] == "CWE-367"
