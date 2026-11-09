"""
Unit & Integration Tests for SageAI Autonomous Cyber Range & Multi-Stage Threat Drill.

Verifies end-to-end execution of APT scenarios across all 10 platform capabilities:
DNS Tunneling, Port Recon, Deception Honeytokens, Ingress WAF, Malware Detonation,
UEBA Anomaly Tracking, and SOAR Cryptographic Merkle Sealing.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.detection.nids_monitor import NIDSMonitor
from app.services.simulation.cyber_range_simulator import cyber_range_simulator


@pytest.mark.asyncio
async def test_dns_tunneling_detection():
    monitor = NIDSMonitor()

    # Normal DNS query
    normal = monitor.analyze_dns_query("api.sageai.io", query_type="A")
    assert normal is None

    # Exfiltration DNS Tunneling (High-entropy base64 label > 32 chars)
    tunnel = monitor.analyze_dns_query(
        "9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a.tunnel.evilc2.com",
        query_type="A",
        client_ip="198.51.100.4",
    )
    assert tunnel is not None
    assert tunnel["alert_type"] == "NIDS_DNS_TUNNELING_DETECTED"
    assert tunnel["severity"] == "CRITICAL"
    assert tunnel["entropy"] > 3.5

    # Anomalous TXT query with elongated payload label
    txt_tunnel = monitor.analyze_dns_query(
        "exfildata1234567890abcdef1234567890.evilc2.com",
        query_type="TXT",
        client_ip="198.51.100.5",
    )
    assert txt_tunnel is not None
    assert txt_tunnel["alert_type"] == "NIDS_DNS_TUNNELING_DETECTED"


@pytest.mark.asyncio
async def test_cyber_range_full_apt_execution():
    result = await cyber_range_simulator.execute_apt_scenario(
        scenario_name="Automated Unit Test APT-29 Scenario",
        attacker_ip="198.51.100.77",
        org_id="test-simulation-org",
    )

    assert result["status"] == "DRILL_SUCCESSFUL"
    assert result["overall_defense_score"] == 100
    assert result["stages_completed"] == 6
    assert len(result["timeline"]) == 6

    # Verify stage phases
    phases = [event["phase"] for event in result["timeline"]]
    assert "RECONNAISSANCE_AND_NIDS" in phases
    assert "DECEPTION_TRAP_TRIGGERED" in phases
    assert "INGRESS_WAF_DEFENSE" in phases
    assert "MALWARE_DETONATION_LAB" in phases
    assert "UEBA_BEHAVIORAL_ANOMALY" in phases

    # Verify containment & cryptographic Merkle block sealing
    assert "virtual_patch_generated" in result["containment"]
    assert "soar_action" in result["containment"]
    assert result["cryptographic_proof"]["merkle_block_index"] >= 0
    assert len(result["cryptographic_proof"]["block_hash"]) == 64


@pytest.mark.asyncio
async def test_simulation_api_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Mock auth token
        from app.core.security import create_access_token

        token = create_access_token(
            {"sub": "admin@sageai.io", "role": "admin", "org": "test-org"}
        )
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Scenarios endpoint
        scenarios_res = await client.get("/simulation/scenarios", headers=headers)
        assert scenarios_res.status_code == 200
        data = scenarios_res.json()
        assert data["status"] == "success"
        assert len(data["scenarios"]) >= 3

        # 2. Run Drill endpoint
        drill_res = await client.post(
            "/simulation/run-apt-drill",
            json={
                "scenario_name": "API Test Drill",
                "attacker_ip": "198.51.100.101",
            },
            headers=headers,
        )
        assert drill_res.status_code == 200
        drill_data = drill_res.json()
        assert drill_data["status"] == "DRILL_SUCCESSFUL"
        assert drill_data["stages_completed"] == 6
