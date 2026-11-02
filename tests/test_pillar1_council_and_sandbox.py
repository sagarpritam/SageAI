"""
Tests for Pillar I: Multi-AI Council Telemetry and Deterministic Sandbox AST Taint Verifier.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.services.llm.consensus_engine import MultiAIConsensusEngine
from app.services.llm.council_telemetry import CouncilModelTelemetry
from app.services.llm.sandbox_verifier import SandboxTaintVerifier


# ─────────────────────────────────────────────────────────────────────────────
# 1. Council Telemetry Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_council_telemetry_metrics_and_health():
    telemetry = CouncilModelTelemetry()

    # Record normal latency responses
    for _ in range(5):
        telemetry.record_call("anthropic", latency_ms=210.0, success=True, tokens_used=120)
    for _ in range(5):
        telemetry.record_call("deepseek", latency_ms=180.0, success=True, tokens_used=300)

    anthropic_health = telemetry.get_provider_health("anthropic")
    assert anthropic_health["status"] == "HEALTHY"
    assert anthropic_health["avg_latency_ms"] == 210.0
    assert anthropic_health["uptime_pct"] == 100.0
    assert anthropic_health["tokens_consumed"] == 600

    matrix = telemetry.get_full_council_matrix()
    assert matrix["council_status"] == "ONLINE"
    assert matrix["total_models"] >= 5


# ─────────────────────────────────────────────────────────────────────────────
# 2. Deterministic Sandbox AST Taint Verifier Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_sandbox_ast_taint_sqli_detected():
    verifier = SandboxTaintVerifier()

    # Python snippet where request.args directly flows into cursor.execute without sanitization
    vulnerable_code = """
def get_user_profile():
    user_id = request.args.get("id")
    query = f"SELECT * FROM users WHERE id = '{user_id}'"
    cursor.execute(query)
"""
    result = verifier.verify_ast_taint(vulnerable_code)

    assert result["ast_verified"] is True
    assert result["deterministic_proof"] is True
    assert result["verdict"] == "CONFIRMED_VIA_AST_TAINT_FLOW"
    assert len(result["findings"]) > 0
    assert result["findings"][0]["vulnerability_class"] == "SQL_INJECTION"


def test_sandbox_ast_taint_sanitized_clean():
    verifier = SandboxTaintVerifier()

    # Python snippet where input is sanitized with int() type casting
    safe_code = """
def get_user_profile():
    user_id = int(request.args.get("id"))
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
"""
    result = verifier.verify_ast_taint(safe_code)

    assert result["ast_verified"] is True
    assert result["deterministic_proof"] is False
    assert result["verdict"] == "UNPROVEN_TAINT_PATH"


def test_sandbox_ast_cmdi_detected():
    verifier = SandboxTaintVerifier()

    # Python snippet with command injection via os.system
    cmdi_code = """
def ping_server():
    target = req.query.get("host")
    cmd = f"ping -c 1 {target}"
    os.system(cmd)
"""
    result = verifier.verify_ast_taint(cmdi_code)

    assert result["deterministic_proof"] is True
    assert result["findings"][0]["vulnerability_class"] == "COMMAND_INJECTION"


def test_sandbox_probe_response_verification():
    verifier = SandboxTaintVerifier()

    probe_result = verifier.verify_probe_response(
        target_url="http://169.254.169.254/latest/meta-data/",
        http_status=200,
        response_body="ami-id: ami-01234567\ninstance-id: i-987654321",
    )

    assert probe_result["deterministic_proof"] is True
    assert probe_result["verdict"] == "CONFIRMED_VIA_ACTIVE_PROBE"


# ─────────────────────────────────────────────────────────────────────────────
# 3. Consensus Engine with Deterministic Sandbox
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_consensus_with_deterministic_sandbox_proof():
    mock_gateway = AsyncMock()

    # Offense, Defense, Arbiter returns
    mock_gateway.generate.side_effect = [
        "Attacker injects SQL payload via user_id.",
        "AST code review shows raw string interpolation into cursor.execute.",
        '{\n  "consensus_verdict": "CONFIRMED_EXPLOITABLE",\n  "confidence_score": 98,\n  "exploitability_rating": "Critical",\n  "executive_synthesis": "AST taint analysis and dual-AI review proved unescaped user input reaching database sink.",\n  "recommended_mitigation": "Use parameterized queries."\n}',
    ]

    vulnerable_snippet = """
user_id = request.args.get("id")
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
"""

    engine = MultiAIConsensusEngine(gateway=mock_gateway)
    res = await engine.evaluate_vulnerability(
        vulnerability_title="SQLi in Profile Search",
        target="internal.app",
        evidence=vulnerable_snippet,
    )

    assert res["deterministic_sandbox"]["deterministic_proof"] is True
    assert res["consensus"]["consensus_verdict"] == "CONFIRMED_EXPLOITABLE"
    assert res["consensus"]["confidence_score"] >= 95

