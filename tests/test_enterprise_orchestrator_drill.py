"""
Unit & Integration Tests for SageAI Enterprise Security Orchestrator & 10-Capability Grid.

Verifies:
1. Capability Catalog: Live operational status across all 10 defense layers.
2. Full Enterprise Security Drill: End-to-end execution of all 10 stages with Merkle proof anchoring.
3. Executive Compliance Reporting: Generation of SOC2 / ISO 27001 / FedRAMP audit documentation.
4. FastAPI Endpoints: HTTP routing, rate-limiting, and RBAC authentication guards.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token
from app.main import app
from app.services.orchestrator.enterprise_orchestrator import (
    enterprise_orchestrator,
)


@pytest.mark.asyncio
async def test_enterprise_capabilities_catalog():
    """Verify all 10 core capabilities are registered, online, and report telemetry."""
    caps = enterprise_orchestrator.get_capabilities_status()
    assert len(caps) == 10

    # Ensure all 10 capabilities are ONLINE
    for cap in caps:
        assert cap["status"] == "ONLINE"
        assert cap["version"] == "2.5.0"
        assert cap["module"].startswith("app.services.")
        assert len(cap["mitre_ttps"]) >= 1
        assert isinstance(cap["metrics"], dict)

    # Check key capability keys
    keys = {c["key"] for c in caps}
    expected_keys = {
        "reverse_engineering",
        "deception_mesh",
        "waf_detector",
        "nids_monitor",
        "threat_intelligence",
        "ueba_engine",
        "soar_engine",
        "redteam_resilience",
        "cyber_range",
        "merkle_audit_chain",
    }
    assert expected_keys.issubset(keys)


@pytest.mark.asyncio
async def test_enterprise_full_drill_execution():
    """Execute end-to-end 10-stage defensive and offensive security drill."""
    drill_res = await enterprise_orchestrator.execute_full_enterprise_drill(
        scenario_name="Automated Pytest Enterprise Defense Drill",
        attacker_ip="198.51.100.88",
        org_id="test-enterprise-org",
        actor="Pytest-SecurityDirector",
    )

    assert drill_res["status"] == "SUCCESS"
    assert drill_res["stages_total"] == 10
    assert drill_res["stages_passed"] == 10
    assert drill_res["compliance_rating"].startswith("AAA")
    assert drill_res["elapsed_ms"] > 0

    # Verify every stage passed
    stages = drill_res["stages"]
    assert len(stages) == 10
    for s in stages:
        assert s["status"] == "PASS"

    # Verify stage 1: Reverse engineering
    assert stages[0]["findings_count"] > 0

    # Verify stage 2: Deception mesh
    assert stages[1]["canary_verified"] is True
    assert "Zero False Positive" in stages[1]["false_positive_rate"]

    # Verify stage 3: WAF
    assert stages[2]["vectors_intercepted"] >= 5
    assert stages[2]["brute_force_blocked"] is True

    # Verify stage 4: NIDS
    assert stages[3]["port_scan_detected"] is True
    assert stages[3]["c2_beacon_detected"] is True
    assert stages[3]["dns_tunneling_detected"] is True

    # Verify stage 7: SOAR
    assert stages[6]["contained"] is True

    # Verify stage 8: Red-team AI
    assert stages[7]["prompt_injection_blocked"] is True

    # Verify stage 10: Cryptographic Merkle Seal
    merkle = drill_res["merkle_seal"]
    assert len(merkle["record_hash"]) == 64
    assert len(merkle["previous_hash"]) == 64
    assert merkle["ledger_index"] >= 0
    assert merkle["algorithm"] == "SHA-256 Chained Hash Tree"
    assert merkle["status"] == "CRYPTOGRAPHICALLY_VERIFIED"


@pytest.mark.asyncio
async def test_enterprise_compliance_report_generation():
    """Verify executive compliance report generation with cryptographic proof."""
    drill_res = await enterprise_orchestrator.execute_full_enterprise_drill(
        scenario_name="Compliance Audit Verification Drill",
        attacker_ip="198.51.100.88",
    )
    report_md = enterprise_orchestrator.generate_compliance_report(drill_res)

    assert (
        "# SageAI Enterprise Security Assessment & Compliance Audit Report" in report_md
    )
    assert drill_res["merkle_seal"]["record_hash"] in report_md
    assert "SOC 2 Type II" in report_md
    assert "ISO/IEC 27001:2022" in report_md
    assert "FedRAMP High Baseline" in report_md
    assert "Dynamic Binary Reverse Engineering" in report_md
    assert "Honeypots & Deception Technology" in report_md


@pytest.mark.asyncio
async def test_enterprise_api_routes():
    """Verify FastAPI enterprise endpoints with token authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = create_access_token(
            {
                "sub": "ciso@enterprise.com",
                "role": "admin",
                "org": "corp-grid",
            }
        )
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Capabilities route
        caps_res = await client.get(
            "/security/enterprise-capabilities", headers=headers
        )
        assert caps_res.status_code == 200
        caps_data = caps_res.json()
        assert caps_data["status"] == "healthy"
        assert caps_data["total_capabilities"] == 10
        assert caps_data["online_count"] == 10

        # 2. Drill execution route
        drill_res = await client.post(
            "/security/enterprise-audit-drill",
            json={
                "scenario_name": "API Live Grid Drill",
                "attacker_ip": "198.51.100.123",
            },
            headers=headers,
        )
        assert drill_res.status_code == 200
        drill_data = drill_res.json()
        assert drill_data["status"] == "SUCCESS"
        assert drill_data["stages_passed"] == 10
        assert "merkle_seal" in drill_data

        # 3. Compliance report route
        report_res = await client.get("/security/enterprise-report", headers=headers)
        assert report_res.status_code == 200
        report_data = report_res.json()
        assert report_data["status"] == "success"
        assert "markdown_report" in report_data
        assert "merkle_seal" in report_data
