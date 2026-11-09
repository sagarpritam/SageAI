"""
Unit & Integration Tests for SageAI Next-5 Strategic Enterprise Capabilities:
1. CSPM & CIEM (CIS Benchmarks & Toxic Risks)
2. Software Supply Chain & CycloneDX 1.5 SBOM
3. Zero-Trust Network Access (ZTNA) & Micro-Segmentation
4. Autonomous Adversary Emulation & MITRE ATT&CK Matrix
5. External Attack Surface Management (EASM) & Shadow IT
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token
from app.main import app
from app.services.adversary.mitre_emulator import MitreAdversaryEmulator
from app.services.cloud_posture.cspm_service import CSPMService
from app.services.easm.shadow_it_hunter import ShadowITHunterService
from app.services.supply_chain.sbom_scanner import SBOMScanner
from app.services.ztna.microsegmentation_service import (
    ZTNAMicrosegmentationService,
)


@pytest.fixture
def anyio_backend():
    return "asyncio"


# ---------------- 1. CSPM & CIEM ----------------
def test_cspm_benchmark_and_toxic_combinations():
    """Verify CIS Benchmark evaluation and detection of toxic IAM + public exposure paths."""
    service = CSPMService()
    test_assets = [
        {
            "name": "alb-ingress",
            "type": "LOAD_BALANCER",
            "cloud": "AWS",
            "is_public": True,
            "has_admin_iam": True,
        },
        {
            "name": "backup-bucket",
            "type": "S3_BUCKET",
            "cloud": "AWS",
            "is_public": True,
        },
        {
            "name": "bastion-host",
            "type": "SECURITY_GROUP",
            "cloud": "AWS",
            "open_ssh": True,
        },
    ]

    result = service.evaluate_cis_benchmarks(
        test_assets, org_id="test-org", actor="Pytest-CSPM"
    )
    assert result["status"] == "COMPLETED"
    assert len(result["toxic_combinations"]) >= 1
    assert (
        "prod" not in result["toxic_combinations"][0]["asset"]
        or "alb" in result["toxic_combinations"][0]["asset"]
    )
    assert len(result["findings"]) >= 2
    assert "merkle_seal" in result
    assert result["merkle_seal"]["status"] == "CRYPTOGRAPHICALLY_VERIFIED"


def test_cspm_remediation_code_generator():
    """Verify generation of automated Terraform and AWS CLI remediation playbooks."""
    service = CSPMService()
    remed = service.generate_remediation_script("FIND-1", "CIS-AWS-2.1.1")
    assert remed["type"] == "S3_BLOCK_PUBLIC_ACCESS"
    assert "put-public-access-block" in remed["aws_cli"]
    assert "aws_s3_bucket_public_access_block" in remed["terraform"]


# ---------------- 2. SUPPLY CHAIN & SBOM ----------------
def test_supply_chain_cyclonedx_sbom_and_typosquatting():
    """Verify CycloneDX 1.5 JSON SBOM generation and package typosquatting detection."""
    service = SBOMScanner()
    manifest = "requests==2.20.0\nfastapi==0.115.0\nrequsts==1.0.0"

    scan = service.scan_supply_chain(
        manifest, project_name="TestApp", org_id="test-org"
    )
    assert scan["status"] == "SUCCESS"
    assert scan["total_components"] == 3
    assert scan["vulnerabilities_count"] >= 1
    assert scan["vulnerabilities"][0]["cve"] == "CVE-2018-18074"

    # Verify typosquat detection
    assert scan["typosquat_warnings_count"] >= 1
    typo = scan["typosquat_warnings"][0]
    assert typo["suspect_package"] == "requsts"
    assert typo["target_popular_package"] == "requests"

    # Verify CycloneDX schema
    sbom = scan["cyclonedx_sbom"]
    assert sbom["bomFormat"] == "CycloneDX"
    assert sbom["specVersion"] == "1.5"
    assert len(sbom["components"]) == 3


# ---------------- 3. ZTNA & MICRO-SEGMENTATION ----------------
def test_ztna_contextual_trust_scoring():
    """Verify contextual trust calculation based on posture, mTLS, and travel anomaly."""
    service = ZTNAMicrosegmentationService()

    # Trusted session
    trusted_context = {
        "device": {"is_managed": True, "disk_encrypted": True, "edr_active": True},
        "auth": {
            "user_id": "ciso@org.com",
            "mfa_type": "FIDO2_WEBAUTHN",
            "has_mtls_cert": True,
        },
        "behavior": {"impossible_travel_flag": False, "tor_exit_node": False},
    }
    trusted_eval = service.evaluate_contextual_trust(trusted_context)
    assert trusted_eval["trust_score"] >= 75
    assert trusted_eval["decision"] == "ALLOW_FULL_ACCESS"
    assert trusted_eval["enclave_tier"] == "TIER_1_SOVEREIGN_ENCLAVE"

    # Compromised / Impossible travel session
    compromised_context = {
        "device": {"is_managed": False},
        "auth": {"user_id": "ciso@org.com"},
        "behavior": {"impossible_travel_flag": True, "tor_exit_node": True},
    }
    comp_eval = service.evaluate_contextual_trust(compromised_context)
    assert comp_eval["trust_score"] <= 30
    assert comp_eval["decision"] == "DENY_AND_QUARANTINE"


def test_ztna_microsegmentation_policy_synthesis():
    """Verify generation of Cilium L7 NetworkPolicy blocking lateral movement."""
    service = ZTNAMicrosegmentationService()
    policy = service.generate_microsegmentation_policy(
        "frontend-web", "core-vault", [5432, 8000], "TCP"
    )

    assert policy["policy_type"] == "Cilium L7 Identity-Aware NetworkPolicy"
    assert policy["lateral_movement_blocked"] is True
    assert "CiliumNetworkPolicy" in policy["yaml_policy"]
    assert "5432" in policy["yaml_policy"]


# ---------------- 4. MITRE ATT&CK & ADVERSARY EMULATION ----------------
def test_mitre_adversary_emulation_and_matrix():
    """Verify MITRE ATT&CK matrix retrieval and APT breach-and-attack simulation."""
    service = MitreAdversaryEmulator()

    matrix = service.get_mitre_matrix()
    assert matrix["tactics_count"] == 14
    assert matrix["average_coverage_pct"] >= 90.0

    drill = service.execute_apt_emulation_drill(actor_id="APT29", org_id="test-org")
    assert drill["status"] == "SUCCESS"
    assert drill["containment_rate_pct"] == 100.0
    assert len(drill["stages"]) >= 5
    assert drill["merkle_seal"]["status"] == "CRYPTOGRAPHICALLY_VERIFIED"


# ---------------- 5. EASM & SHADOW IT ----------------
def test_easm_shadow_it_and_takeover_detection():
    """Verify discovery of external assets, dangling CNAME takeovers, and shadow IT."""
    service = ShadowITHunterService()
    scan = service.scan_external_attack_surface("enterprise.com", org_id="test-org")

    assert scan["status"] == "COMPLETED"
    assert scan["total_assets_discovered"] >= 4
    assert scan["shadow_it_count"] >= 1
    assert len(scan["takeover_vulnerabilities"]) >= 1

    takeover = scan["takeover_vulnerabilities"][0]
    assert "docs.enterprise.com" in takeover["subdomain"]
    assert "github.io" in takeover["vulnerable_cname"]
    assert takeover["severity"] == "HIGH"
    assert "merkle_seal" in scan


# ---------------- 6. FASTAPI ENDPOINTS ----------------
@pytest.mark.asyncio
async def test_next5_fastapi_endpoints():
    """Verify FastAPI endpoints across all 5 capabilities with bearer token auth."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = create_access_token(
            {"sub": "ciso@enterprise.com", "role": "admin", "org": "corp-grid"}
        )
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 1. Unauthenticated request to CSPM should be rejected
        unauth_res = await client.post("/cspm/audit", json={"cloud_assets": []})
        assert unauth_res.status_code in (401, 403)

        # 2. CSPM Audit
        cspm_res = await client.post(
            "/cspm/audit",
            json={
                "cloud_assets": [
                    {
                        "name": "app-alb",
                        "type": "LOAD_BALANCER",
                        "cloud": "AWS",
                        "is_public": True,
                        "has_admin_iam": True,
                    }
                ]
            },
            headers=auth_headers,
        )
        assert cspm_res.status_code == 200
        assert "toxic_combinations" in cspm_res.json()

        # 3. Supply Chain Scan
        sbom_res = await client.post(
            "/supply-chain/scan",
            json={"manifest_content": "requests==2.20.0", "project_name": "TestApp"},
            headers=auth_headers,
        )
        assert sbom_res.status_code == 200
        assert "cyclonedx_sbom" in sbom_res.json()

        # 4. ZTNA Evaluate Trust
        ztna_res = await client.post(
            "/ztna/evaluate-trust",
            json={
                "session_context": {
                    "device": {"is_managed": True, "disk_encrypted": True},
                    "auth": {"mfa_type": "FIDO2_WEBAUTHN", "has_mtls_cert": True},
                }
            },
            headers=auth_headers,
        )
        assert ztna_res.status_code == 200
        assert ztna_res.json()["decision"] == "ALLOW_FULL_ACCESS"

        # 5. Adversary Matrix & Drill
        matrix_res = await client.get("/adversary/matrix", headers=auth_headers)
        assert matrix_res.status_code == 200
        assert matrix_res.json()["tactics_count"] == 14

        drill_res = await client.post(
            "/adversary/run-drill",
            json={"actor_id": "APT29"},
            headers=auth_headers,
        )
        assert drill_res.status_code == 200
        assert drill_res.json()["containment_rate_pct"] == 100.0

        # 6. EASM Scan
        easm_res = await client.post(
            "/easm/scan",
            json={"target_domain": "enterprise.com"},
            headers=auth_headers,
        )
        assert easm_res.status_code == 200
        assert len(easm_res.json()["assets"]) > 0
