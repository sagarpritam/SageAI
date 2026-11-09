"""
Unit & Integration Tests for SageAI 5 New Strategic Enterprise Defense Capabilities:
1. Autonomous AI SOC & Neural Alert Triage Engine
2. AI-Powered Threat Hunting & Multi-SIEM Query Forge
3. Autonomous Anti-Ransomware Defense & Canary Trap Engine
4. Autonomous Cloud Data Security Posture Management (DSPM)
5. Decentralized Cyber Threat Intelligence (CTI) STIX 2.1 / TAXII 2.1 Hub
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token
from app.main import app
from app.services.ai_soc.neural_triage_engine import ai_soc_engine
from app.services.cti.stix_taxii_service import cti_service
from app.services.dspm.dspm_service import dspm_service
from app.services.ransomware.anti_ransomware_service import anti_ransomware_service
from app.services.threat_hunting.threat_hunter import threat_hunter_service


@pytest.fixture
def anyio_backend():
    return "asyncio"


# -------------------------------------------------------------
# 1. Autonomous AI SOC Tests
# -------------------------------------------------------------
def test_ai_soc_neural_alert_triage():
    """Verify alert clustering, noise reduction, and tiered triage."""
    sample_alerts = [
        {
            "source_ip": "198.51.100.42",
            "target_asset": "prod-api",
            "type": "sqli_probe",
            "severity": "LOW",
        },
        {
            "source_ip": "198.51.100.42",
            "target_asset": "prod-api",
            "type": "xss_probe",
            "severity": "LOW",
        },
        {
            "source_ip": "198.51.100.42",
            "target_asset": "prod-api",
            "type": "port_sweep",
            "severity": "INFO",
        },
        {
            "source_ip": "203.0.113.88",
            "target_asset": "k8s-pod-auth",
            "type": "ebpf_setns_escape",
            "severity": "CRITICAL",
        },
        {
            "source_ip": "203.0.113.88",
            "target_asset": "k8s-pod-auth",
            "type": "honeytoken_aws_access",
            "severity": "CRITICAL",
        },
    ]

    report = ai_soc_engine.triage_alerts(
        sample_alerts, actor="Pytest-SOC", org_id="test-org"
    )

    assert report["status"] == "COMPLETED"
    assert report["raw_alert_count"] == 5
    assert report["correlated_incident_count"] == 2
    # Noise reduction: (5 - 2) / 5 = 60.0%
    assert "60" in report["noise_reduction_ratio"]
    assert report["triage_summary"]["tier_3_critical_escalation"] >= 1
    assert "merkle_seal" in report
    assert report["merkle_seal"]["status"] == "CRYPTOGRAPHICALLY_VERIFIED"

    # Executive Briefing
    briefing = ai_soc_engine.generate_executive_briefing(report)
    assert briefing["critical_escalation_count"] >= 1
    assert len(briefing["recommended_playbook"]) >= 1


# -------------------------------------------------------------
# 2. Threat Hunting & Query Forge Tests
# -------------------------------------------------------------
def test_threat_hunting_query_forge_and_execution():
    """Verify multi-SIEM query forge (Sigma, KQL, SPL, EQL) and retrospective hunt execution."""
    hypothesis = "Adversaries executing certutil or powershell with encoded commands."

    queries = threat_hunter_service.forge_query(hypothesis)
    assert "title: SageAI Autonomous Threat Hunt" in queries["sigma_yaml"]
    assert "DeviceProcessEvents" in queries["sentinel_kql"]
    assert "index=security" in queries["splunk_spl"]
    assert "sequence by host.id" in queries["elastic_eql"]

    mock_events = [
        {
            "id": "EVT-01",
            "process": "powershell.exe",
            "command_line": "powershell.exe -enc aW52b2tlLW1pbWlrYXR6",
        },
        {"id": "EVT-02", "process": "nginx", "command_line": "nginx -s reload"},
    ]

    hunt = threat_hunter_service.execute_hunt(
        hypothesis, mock_events, actor="Pytest-Hunter", org_id="test-org"
    )
    assert hunt["status"] == "COMPLETED"
    assert hunt["confirmed_threat_count"] >= 1
    assert hunt["hunt_verdict"] == "THREATS_DETECTED"
    assert "merkle_seal" in hunt


# -------------------------------------------------------------
# 3. Anti-Ransomware Defense Tests
# -------------------------------------------------------------
def test_anti_ransomware_entropy_and_containment():
    """Verify Shannon entropy calculation, canary traps, VSS protection, and attack containment."""
    # Low entropy test
    low_entropy = anti_ransomware_service.calculate_entropy("AAAAABBBBBCCCCCDDDDD")
    assert low_entropy < 3.0

    # High entropy (random byte simulation)
    import os

    random_bytes = os.urandom(1024)
    high_entropy = anti_ransomware_service.calculate_entropy(random_bytes)
    assert high_entropy > 7.5

    # Deploy canaries
    canaries = anti_ransomware_service.deploy_canaries(["/test/data"])
    assert len(canaries) >= 4

    # Simulate attack
    sim = anti_ransomware_service.simulate_attack(
        actor="Pytest-Ransomware", org_id="test-org"
    )
    assert sim["threat_level"] == "CRITICAL_RANSOMWARE_ATTACK"
    assert sim["containment_status"] == "AUTONOMOUS_CONTAINMENT_EXECUTED"
    assert len(sim["offending_pids_isolated"]) >= 1
    assert sim["canaries_tripped_count"] >= 1
    assert sim["vss_tamper_count"] >= 1


# -------------------------------------------------------------
# 4. Cloud DSPM Tests
# -------------------------------------------------------------
def test_dspm_sensitive_data_classification_and_toxic_risk():
    """Verify multi-cloud sensitive data classification, toxic combinations, and remediation plan."""
    sample_records = [
        "TX-01 user_ssn=123-45-6789 card=4111222233334444 email=sec@corp.com",
        "MRN-100234 DIAGNOSIS=HYPERTENSION",
        "AWS_KEY=AKIAIOSFODNN7EXAMPLE",
    ]

    # Public bucket without encryption = Toxic Combination
    report = dspm_service.scan_data_store(
        store_id="s3-public-customer-records",
        cloud_provider="AWS",
        store_type="OBJECT_STORAGE",
        sample_records=sample_records,
        is_public=True,
        encryption_enabled=False,
        actor="Pytest-DSPM",
        org_id="test-org",
    )

    assert report["status"] == "COMPLETED"
    assert report["toxic_combination_detected"] is True
    assert report["posture_grade"] == "F"
    assert report["total_sensitive_items"] >= 3
    assert "PCI_DSS" in report["category_distribution"]
    assert "PII" in report["category_distribution"]

    # Remediation
    remediation = dspm_service.generate_remediation_plan(report)
    assert "aws_s3_bucket_public_access_block" in remediation["terraform_hcl"]
    assert "aws s3api put-public-access-block" in remediation["aws_cli_commands"]


# -------------------------------------------------------------
# 5. CTI STIX 2.1 / TAXII 2.1 Tests
# -------------------------------------------------------------
def test_cti_stix_bundle_generation_and_taxii():
    """Verify OASIS STIX 2.1 bundle synthesis, indicator relationships, and TAXII collections."""
    actors = cti_service.get_threat_actors()
    assert len(actors) >= 4
    assert any("APT28" in a["name"] for a in actors)

    indicators = [
        {
            "type": "sha256",
            "value": "8f7e6d5c4b3a21098f7e6d5c4b3a21098f7e6d5c4b3a21098f7e6d5c4b3a2109",
        },
        {"type": "ip", "value": "198.51.100.89"},
    ]

    bundle_res = cti_service.generate_stix_bundle(
        actor_name="APT28",
        indicators=indicators,
        campaign_name="Diplomatic Reconnaissance 2026",
        actor="Pytest-CTI",
        org_id="test-org",
    )

    assert bundle_res["status"] == "SUCCESS"
    bundle = bundle_res["stix_bundle"]
    assert bundle["type"] == "bundle"
    assert bundle["spec_version"] == "2.1"
    assert len(bundle["objects"]) >= 5

    # Parse bundle
    parsed = cti_service.parse_stix_bundle(bundle)
    assert parsed["status"] == "PARSED"
    assert parsed["indicators_extracted"] == 2
    assert parsed["threat_actors_extracted"] == 1

    # TAXII collections
    taxii = cti_service.get_taxii_collections()
    assert len(taxii["collections"]) >= 3


# -------------------------------------------------------------
# 6. FastAPI Integration Tests
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_fastapi_wave2_endpoints():
    """Verify all 5 new capability FastAPI router endpoints with JWT authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = create_access_token(
            {"sub": "ciso@enterprise.com", "role": "admin", "org": "corp-grid"}
        )
        headers = {"Authorization": f"Bearer {token}"}

        # 1. AI SOC Triage
        soc_res = await client.post(
            "/ai-soc/triage",
            json={
                "raw_alerts": [
                    {
                        "source_ip": "1.2.3.4",
                        "target_asset": "web",
                        "type": "sqli",
                        "severity": "LOW",
                    }
                ]
            },
            headers=headers,
        )
        assert soc_res.status_code == 200
        assert soc_res.json()["status"] == "success"

        # 2. Threat Hunting
        hunt_res = await client.post(
            "/threat-hunting/forge-query",
            json={"hypothesis": "Powershell encoded command execution"},
            headers=headers,
        )
        assert hunt_res.status_code == 200
        assert "sigma_yaml" in hunt_res.json()["queries"]

        # 3. Anti-Ransomware
        canary_res = await client.post(
            "/ransomware/deploy-canaries",
            json={"target_directories": ["/tmp/canaries"]},
            headers=headers,
        )
        assert canary_res.status_code == 200
        assert canary_res.json()["armed_count"] >= 4

        # 4. Cloud DSPM
        dspm_res = await client.post(
            "/dspm/scan",
            json={
                "store_id": "s3-test-store",
                "cloud_provider": "AWS",
                "store_type": "OBJECT_STORAGE",
                "sample_records": ["card=4111222233334444 ssn=123-45-6789"],
                "is_public": True,
                "encryption_enabled": False,
                "region": "us-east-1",
            },
            headers=headers,
        )
        assert dspm_res.status_code == 200
        assert dspm_res.json()["dspm_report"]["toxic_combination_detected"] is True

        # 5. CTI STIX / TAXII
        taxii_res = await client.get("/cti/taxii/collections", headers=headers)
        assert taxii_res.status_code == 200
        assert len(taxii_res.json()["collections"]) >= 3
