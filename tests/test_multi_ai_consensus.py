"""
Unit tests for Multi-AI Gateway Clients and Red-vs-Blue Consensus Engine.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.services.llm.anthropic_client import AnthropicClient
from app.services.llm.consensus_engine import MultiAIConsensusEngine
from app.services.llm.deepseek_client import DeepSeekClient
from app.services.llm.gateway import llm_gateway
from app.services.llm.gemini_client import GeminiClient
from app.services.llm.vercel_client import VercelGatewayClient

# ─────────────────────────────────────────────────────────────────────────────
# 1. Specialized Provider Clients Tests
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_anthropic_client_generation():
    client = AnthropicClient()

    class MockResponse:
        status_code = 200

        def raise_for_status(self):
            pass

        def json(self):
            return {
                "content": [{"type": "text", "text": "def test_patch(): return True"}],
                "usage": {"input_tokens": 15, "output_tokens": 25},
            }

    with (
        patch("app.core.config.settings.ANTHROPIC_API_KEY", "sk-ant-test-key"),
        patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post,
    ):
        mock_post.return_value = MockResponse()
        result = await client.generate(
            "Generate security patch", system_message="Security bot"
        )

        assert result["content"] == "def test_patch(): return True"
        assert result["usage"]["prompt_tokens"] == 15
        assert result["usage"]["completion_tokens"] == 25


@pytest.mark.asyncio
async def test_gemini_client_generation():
    client = GeminiClient()

    class MockResponse:
        status_code = 200

        def raise_for_status(self):
            pass

        def json(self):
            return {
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {"text": "Log forensic analysis: No anomalies found."}
                            ]
                        }
                    }
                ],
                "usageMetadata": {"promptTokenCount": 500, "candidatesTokenCount": 50},
            }

    with (
        patch("app.core.config.settings.GEMINI_API_KEY", "test-gemini-key"),
        patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post,
    ):
        mock_post.return_value = MockResponse()
        result = await client.generate("Analyze 10,000 access log rows")

        assert "No anomalies" in result["content"]
        assert result["usage"]["prompt_tokens"] == 500


@pytest.mark.asyncio
async def test_deepseek_client_generation():
    client = DeepSeekClient()

    class MockResponse:
        status_code = 200

        def raise_for_status(self):
            pass

        def json(self):
            return {
                "choices": [
                    {
                        "message": {
                            "content": "Multi-hop exploit chain: Step 1 SQLi -> Step 2 SSH Key Exfil"
                        }
                    }
                ],
                "usage": {"prompt_tokens": 30, "completion_tokens": 40},
            }

    with (
        patch("app.core.config.settings.DEEPSEEK_API_KEY", "sk-deepseek-test"),
        patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post,
    ):
        mock_post.return_value = MockResponse()
        result = await client.generate("Plan lateral movement path")

        assert "Multi-hop exploit chain" in result["content"]
        assert result["usage"]["prompt_tokens"] == 30


@pytest.mark.asyncio
async def test_vercel_gateway_client_generation():
    client = VercelGatewayClient()

    class MockResponse:
        status_code = 200

        def raise_for_status(self):
            pass

        def json(self):
            return {
                "choices": [{"message": {"content": "Vercel routed response"}}],
                "usage": {"prompt_tokens": 10, "completion_tokens": 20},
            }

    with (
        patch("app.core.config.settings.AI_GATEWAY_API_KEY", "vck-test-key"),
        patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post,
    ):
        mock_post.return_value = MockResponse()
        result = await client.generate("Ping model gateway")

        assert result["content"] == "Vercel routed response"


# ─────────────────────────────────────────────────────────────────────────────
# 2. LLMGateway Routing Tests
# ─────────────────────────────────────────────────────────────────────────────


def test_gateway_task_specialization_routing():
    assert llm_gateway.route_task("code_audit") == "anthropic"
    assert llm_gateway.route_task("patch_generation") == "anthropic"
    assert llm_gateway.route_task("exploit_reasoning") == "deepseek"
    assert llm_gateway.route_task("attack_chain") == "deepseek"
    assert llm_gateway.route_task("forensics_logs") == "gemini"
    assert llm_gateway.route_task("large_context") == "gemini"
    assert llm_gateway.route_task("red_team") == "nvidia"
    assert llm_gateway.route_task("unknown_task") == "openai"


# ─────────────────────────────────────────────────────────────────────────────
# 3. Red-vs-Blue Consensus Engine Tests
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_multi_ai_consensus_evaluation():
    mock_gateway = AsyncMock()

    # Step 1 (Offense): DeepSeek proposes exploit
    # Step 2 (Defense): Claude finds mitigating sanitizer
    # Step 3 (Arbiter): Gemini synthesizes verdict
    mock_gateway.generate.side_effect = [
        "Attacker injects UNION SELECT to dump credentials via /api/users.",
        "Query uses SQLAlchemy parameterized bindings; injection parameter is strictly integer type cast.",
        '{\n  "consensus_verdict": "FALSE_POSITIVE",\n  "confidence_score": 95,\n  "exploitability_rating": "Informational",\n  "executive_synthesis": "Input parameter is strictly typecast as an integer and bound via parameterized queries. Zero exploitability.",\n  "recommended_mitigation": "Retain parameterized typing."\n}',
    ]

    engine = MultiAIConsensusEngine(gateway=mock_gateway)
    res = await engine.evaluate_vulnerability(
        vulnerability_title="SQL Injection in User Search",
        target="api.enterprise.internal",
        evidence="GET /api/users?id=1'",
    )

    assert res["vulnerability_title"] == "SQL Injection in User Search"
    assert "deepseek-reasoner" in res["models_engaged"]
    assert "claude-3-7-sonnet" in res["models_engaged"]
    assert "gemini-2.0-flash" in res["models_engaged"]
    assert res["consensus"]["consensus_verdict"] == "FALSE_POSITIVE"
    assert res["consensus"]["confidence_score"] == 95
    assert mock_gateway.generate.call_count == 3
