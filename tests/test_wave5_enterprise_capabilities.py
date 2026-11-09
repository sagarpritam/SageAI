"""
Test Suite for Wave 5 Enterprise Capabilities:
1. Web3 & Smart Contract Security Auditor (EVM / Solana / Move)
2. Autonomous SDN Ephemeral Network Isolation (Micro-Shield)
3. Dark Web & Infostealer Intelligence Radar (Lumma / RedLine / Vidar)
4. Zero-Knowledge Proof (ZKP) Compliance Attestation (zk-SNARKs)
5. MITRE D3FEND Defensive Countermeasure Matrix & Graph Engine
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.d3fend.d3fend_matrix_service import d3fend_matrix_service
from app.services.infostealer.darkweb_radar import darkweb_radar_service
from app.services.sdn_shield.sdn_isolation_engine import sdn_isolation_engine
from app.services.web3_security.smart_contract_auditor import smart_contract_auditor
from app.services.zkp.zkp_attestation_service import zkp_attestation_service


@pytest.fixture
def client():
    return TestClient(app)


def test_web3_security_service():
    # 1. Audit sample contract
    report = smart_contract_auditor.audit_contract_code()
    assert report["contract_name"] == "VulnerableVault.sol"
    assert report["vulnerabilities_detected"] >= 3
    vuln_categories = [v["category"] for v in report["vulnerabilities"]]
    assert any("Reentrancy" in c for c in vuln_categories)
    assert any("Unprotected Ether" in c for c in vuln_categories)
    assert any("Flash Loan" in c for c in vuln_categories)

    # 2. Generate Foundry PoC
    poc = smart_contract_auditor.generate_foundry_poc()
    assert "Foundry" in poc["test_framework"]
    assert "test_exploit_reentrancy_drain" in poc["foundry_code"]


def test_sdn_shield_service():
    # 1. Isolate AWS asset
    iso = sdn_isolation_engine.isolate_asset(
        asset_id="i-0a8f9c1e2b4d5e",
        asset_type="AWS_EC2",
        reason="Active C2 socket detected",
    )
    assert iso["status"] == "ISOLATED_QUARANTINED"
    assert iso["applied_sdn_rule"]["platform"] == "AWS VPC"

    # 2. Verify in active isolations
    active = sdn_isolation_engine.list_active_isolations()
    assert len(active) >= 1
    assert any(a["isolation_id"] == iso["isolation_id"] for a in active)

    # 3. Release asset
    rel = sdn_isolation_engine.release_asset(iso["isolation_id"])
    assert rel["status"] == "ASSET_NETWORK_RESTORED"


def test_darkweb_radar_service():
    # 1. Sweep telemetry
    radar = darkweb_radar_service.scan_darkweb_telemetry(domain_filter="enterprise.io")
    assert radar["compromised_credentials_found"] >= 2
    assert radar["active_session_cookies_intercepted"] >= 1
    assert radar["stealer_exposure_index"] > 0

    # 2. Session invalidation
    revoc = darkweb_radar_service.execute_session_invalidation(
        token_hash="4a8f9c1b2d3e",
        user_identity="sarah.connor@enterprise.io",
    )
    assert revoc["status"] == "SESSION_REVOKED_SUCCESSFULLY"
    assert len(revoc["revoked_idp_providers"]) >= 2


def test_zkp_service():
    # 1. Generate compliance proof
    attestation = zkp_attestation_service.generate_compliance_proof("SOC 2 Type II")
    assert "zk_proof" in attestation
    proof = attestation["zk_proof"]
    assert proof["protocol"] == "Groth16 zk-SNARK"
    assert len(proof["pi_a"]) == 2
    assert len(proof["pi_b"]) == 2
    assert len(proof["pi_c"]) == 2

    # 2. Verify compliance proof
    verification = zkp_attestation_service.verify_compliance_proof(
        proof_id=attestation["proof_id"],
        zk_proof=attestation["zk_proof"],
        public_signals=attestation["public_signals"],
    )
    assert verification["valid"] is True
    assert verification["verification_status"] == "MATHEMATICALLY_VERIFIED"


def test_d3fend_service():
    # 1. Full matrix
    matrix = d3fend_matrix_service.get_d3fend_matrix()
    assert matrix["total_countermeasures"] >= 8
    assert matrix["defense_maturity_index"] > 50
    assert "DETECT" in matrix["domains"]
    assert "ISOLATE" in matrix["domains"]

    # 2. Query countermeasure for attack technique
    query_res = d3fend_matrix_service.get_countermeasure_for_attack("PowerShell")
    assert query_res["countermeasures_found"] >= 1
    names = [c["d3fend_name"] for c in query_res["countermeasures"]]
    assert any("Process Spawn Analysis" in n or "Script Command" in n for n in names)


def test_wave5_routers(client):
    from app.core.security import get_current_user

    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "SecOpsDirector",
        "org": "enterprise",
    }

    try:
        # Web3
        res = client.post("/web3-security/audit", json={})
        assert res.status_code == 200
        assert "audit_report" in res.json()

        # SDN Shield
        res = client.get("/sdn-shield/isolations")
        assert res.status_code == 200
        assert "active_isolations" in res.json()

        # Dark Web Radar
        res = client.get("/darkweb-radar/scan")
        assert res.status_code == 200
        assert "radar_report" in res.json()

        # ZKP
        res = client.get("/zkp/proof")
        assert res.status_code == 200
        assert "attestation" in res.json()

        # D3FEND
        res = client.get("/d3fend/matrix")
        assert res.status_code == 200
        assert "matrix" in res.json()
    finally:
        app.dependency_overrides.clear()
