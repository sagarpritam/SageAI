"""
Test Suite for Wave 3 Enterprise Capabilities:
1. Autonomous Red Team Adversary Emulation (MITRE Caldera / Atomic Red Team)
2. Cloud Infrastructure-as-Code (IaC) Drift & Remediation Engine
3. Software Bill of Materials (SBOM) & OpenVEX Attestation Engine
4. Identity Threat Detection & Response (ITDR)
5. Continuous Attack Path & Graph Choke-Point Analysis (CART)
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.cart.cart_engine import cart_engine
from app.services.cloud_posture.iac_drift_engine import iac_drift_engine
from app.services.itdr.itdr_service import itdr_service
from app.services.redteam.atomic_adversary_emulator import atomic_adversary_emulator
from app.services.supply_chain.sbom_vex_engine import sbom_vex_engine


@pytest.fixture
def client():
    return TestClient(app)


def test_atomic_adversary_emulator():
    # 1. Catalog validation
    techniques = atomic_adversary_emulator.list_techniques()
    assert len(techniques) >= 8
    tech_ids = [t["technique_id"] for t in techniques]
    assert "T1059.001" in tech_ids
    assert "T1003.001" in tech_ids

    # 2. Atomic test execution in safe dry-run
    result = atomic_adversary_emulator.run_atomic_test(
        "T1059.001", target_host="test-runner", dry_run=True
    )
    assert result["status"] == "SUCCESS_SAFE_CONTAINED"
    assert result["blue_team_detected"] is True
    assert "audit_tx_id" in result

    # 3. Caldera campaign execution
    campaign_res = atomic_adversary_emulator.execute_campaign(
        "APT29_COZY_BEAR", target_network="test-vpc"
    )
    assert campaign_res["status"] == "COMPLETED"
    assert campaign_res["total_steps"] == 4
    assert campaign_res["coverage_percentage"] > 0
    assert "audit_tx_id" in campaign_res


def test_iac_drift_engine():
    # 1. Scan default resources for drift
    scan = iac_drift_engine.scan_drift()
    assert scan["drifts_detected"] >= 4
    assert scan["critical_drifts"] >= 2
    drift_types = [d["drift_type"] for d in scan["drifts"]]
    assert "DRIFT_SECURITY_GROUP_INGRESS_ALL" in drift_types
    assert "DRIFT_UNENCRYPTED_S3_STORAGE" in drift_types
    assert "DRIFT_IAM_WILDCARD_ADMIN" in drift_types

    # 2. Generate Git PR
    pr = iac_drift_engine.generate_git_pr(drift_ids=[scan["drifts"][0]["drift_id"]])
    assert pr["status"] == "READY_FOR_MERGE"
    assert "resource" in pr["diff"] or "securityContext" in pr["diff"]
    assert pr["remediated_drifts"] >= 1


def test_sbom_vex_engine():
    # 1. CycloneDX 1.5
    cdx = sbom_vex_engine.generate_cyclonedx_sbom()
    assert cdx["bomFormat"] == "CycloneDX"
    assert cdx["specVersion"] == "1.5"
    assert len(cdx["components"]) >= 5

    # 2. SPDX 2.3
    spdx = sbom_vex_engine.generate_spdx_sbom()
    assert spdx["spdxVersion"] == "SPDX-2.3"
    assert len(spdx["packages"]) >= 5

    # 3. OpenVEX v0.2.0
    vex = sbom_vex_engine.generate_openvex()
    assert vex["@context"] == "https://openvex.dev/ns/v0.2.0"
    assert len(vex["statements"]) >= 3
    assert all("status" in s for s in vex["statements"])
    assert all("justification" in s for s in vex["statements"])

    # 4. SLSA Level 3
    slsa = sbom_vex_engine.generate_slsa_provenance("sageai-release.tar.gz")
    assert slsa["_type"] == "https://in-toto.io/Statement/v1"
    assert slsa["predicateType"] == "https://slsa.dev/provenance/v1"


def test_itdr_service():
    # 1. Analyze identity telemetry
    report = itdr_service.analyze_identity_telemetry()
    assert report["threats_detected"] >= 3
    threat_types = [t["threat_type"] for t in report["threats"]]
    assert "IMPOSSIBLE_TRAVEL" in threat_types
    assert "MFA_FATIGUE_PUSH_BOMBING" in threat_types
    assert "SHADOW_ADMIN_ESCALATION" in threat_types
    assert report["itdr_risk_index"] > 0

    # 2. Containment playbook execution
    containment = itdr_service.execute_containment_action(
        user_email="sarah.connor@enterprise.io",
        action="REVOKE_SESSION_AND_ENFORCE_FIDO2",
    )
    assert containment["status"] == "CONTAINED_SUCCESSFULLY"
    assert containment["oauth_tokens_revoked"] is True


def test_cart_engine():
    # 1. Topology
    topo = cart_engine.get_topology()
    assert len(topo["nodes"]) >= 7
    assert len(topo["edges"]) >= 7

    # 2. Attack path discovery & choke point
    paths = cart_engine.discover_attack_paths()
    assert paths["total_attack_paths_found"] >= 3
    assert paths["blast_radius_score"] > 0
    assert paths["choke_point"]["node_name"] == "Core Bastion Jump-Host"
    assert paths["choke_point"]["path_collapse_percentage"] > 50

    # 3. Choke point severance execution
    severance = cart_engine.execute_choke_point_severance("node-bastion")
    assert severance["status"] == "CHOKE_POINT_SEVERED_SUCCESSFULLY"
    assert len(severance["rules_applied"]) >= 3


def test_wave3_routers(client):
    # Test router endpoints exist and respond (even with mock/default tokens)
    # Auth override for test client if needed
    from app.core.security import get_current_user

    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "SecOpsDirector",
        "org": "enterprise",
    }

    try:
        # Atomic Red Team
        res = client.get("/atomic-redteam/techniques")
        assert res.status_code == 200
        assert "techniques" in res.json()

        # IaC Drift
        res = client.get("/iac-drift/scan")
        assert res.status_code == 200
        assert "drift_report" in res.json()

        # SBOM & OpenVEX
        res = client.get("/sbom-vex/openvex")
        assert res.status_code == 200
        assert "@context" in res.json()

        # ITDR
        res = client.get("/itdr/telemetry")
        assert res.status_code == 200
        assert "itdr_report" in res.json()

        # CART
        res = client.get("/cart/attack-paths")
        assert res.status_code == 200
        assert "analysis" in res.json()
    finally:
        app.dependency_overrides.clear()
