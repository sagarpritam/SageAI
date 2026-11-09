"""
Unit & Integration Tests for SageAI Automated Threat Modeling Engine (STRIDE + DREAD).
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token
from app.main import app
from app.services.threat_modeling.threat_modeler import (
    STRIDE_KNOWLEDGE_BASE,
    ThreatModelingEngine,
    threat_modeling_engine,
)


@pytest.fixture
def anyio_backend():
    return "asyncio"


def test_threat_modeling_templates():
    """Verify built-in architecture baseline templates."""
    templates = threat_modeling_engine.get_architecture_templates()
    assert "cloud_microservices" in templates
    assert "kubernetes_infrastructure" in templates

    cloud_tmpl = templates["cloud_microservices"]
    assert len(cloud_tmpl["components"]) >= 4
    assert len(cloud_tmpl["data_flows"]) >= 3
    assert len(cloud_tmpl["trust_boundaries"]) >= 2
    assert "mermaid_diagram" in cloud_tmpl


def test_stride_24_vector_catalog():
    """Verify comprehensive 24-vector STRIDE enterprise knowledge base (4 per category)."""
    assert len(STRIDE_KNOWLEDGE_BASE) == 24
    categories = [t["category"] for t in STRIDE_KNOWLEDGE_BASE]
    for expected in [
        "Spoofing",
        "Tampering",
        "Repudiation",
        "Information Disclosure",
        "Denial of Service",
        "Elevation of Privilege",
    ]:
        assert categories.count(expected) == 4

    for t in STRIDE_KNOWLEDGE_BASE:
        assert t["mitre_attack"].startswith("T")
        assert len(t["remediation"]) > 10
        assert "patch_type" in t


def test_dread_calculation():
    """Verify quantitative DREAD scoring algorithm and severity thresholds."""
    engine = ThreatModelingEngine()

    # Critical threat (score >= 40)
    crit = engine.calculate_dread_score(
        {
            "damage": 9,
            "reproducibility": 9,
            "exploitability": 8,
            "affected_users": 9,
            "discoverability": 8,
        }
    )
    assert crit["dread_total"] == 43
    assert crit["dread_average"] == 8.6
    assert crit["severity"] == "CRITICAL"

    # High threat (30 - 39)
    high = engine.calculate_dread_score(
        {
            "damage": 7,
            "reproducibility": 7,
            "exploitability": 6,
            "affected_users": 7,
            "discoverability": 6,
        }
    )
    assert high["dread_total"] == 33
    assert high["dread_average"] == 6.6
    assert high["severity"] == "HIGH"

    # Medium threat (20 - 29)
    med = engine.calculate_dread_score(
        {
            "damage": 5,
            "reproducibility": 5,
            "exploitability": 4,
            "affected_users": 5,
            "discoverability": 4,
        }
    )
    assert med["dread_total"] == 23
    assert med["dread_average"] == 4.6
    assert med["severity"] == "MEDIUM"

    # Low threat (< 20)
    low = engine.calculate_dread_score(
        {
            "damage": 3,
            "reproducibility": 3,
            "exploitability": 2,
            "affected_users": 3,
            "discoverability": 3,
        }
    )
    assert low["dread_total"] == 14
    assert low["dread_average"] == 2.8
    assert low["severity"] == "LOW"


def test_threat_modeling_analysis_and_remediation():
    """Verify STRIDE decomposition, mitigation ticket generation, and Merkle seal."""
    engine = ThreatModelingEngine()
    components = [
        {
            "id": "comp-1",
            "name": "Public API Gateway",
            "type": "API_GATEWAY",
            "exposure": "PUBLIC",
        },
        {
            "id": "comp-2",
            "name": "Auth Microservice",
            "type": "CORE_SERVICE",
            "exposure": "PRIVATE",
        },
        {
            "id": "comp-3",
            "name": "Postgres Database",
            "type": "DATA_STORE",
            "exposure": "ISOLATED",
        },
    ]

    result = engine.analyze_architecture(
        components=components,
        org_id="test-tm-org",
        actor="Pytest-ThreatModeler",
    )

    assert result["status"] == "SUCCESS"
    assert result["components_count"] == 3
    assert result["total_threats"] > 0
    assert "severity_summary" in result
    assert "stride_summary" in result

    # Check that STRIDE categories are present
    stride_summary = result["stride_summary"]
    assert stride_summary["Spoofing"] >= 1
    assert stride_summary["Tampering"] >= 1
    assert stride_summary["Elevation of Privilege"] >= 1

    # Check generated remediation tickets
    tickets = result["remediation_tickets"]
    assert len(tickets) > 0
    first_ticket = tickets[0]
    assert first_ticket["ticket_key"].startswith("SEC-")
    assert first_ticket["priority"] in ["P0", "P1", "P2"]
    assert len(first_ticket["action_items"]) >= 2
    assert "patch_type" in first_ticket

    # Check Merkle seal
    merkle = result["merkle_seal"]
    assert merkle["status"] == "CRYPTOGRAPHICALLY_VERIFIED"
    assert len(merkle["record_hash"]) == 64


def test_mermaid_diagram_parser():
    """Verify parsing of Mermaid architecture diagram text into components and boundaries."""
    engine = ThreatModelingEngine()
    diagram = """graph TD
        User([Public Client]) -->|HTTPS| WAF[Edge WAF Gateway]
        subgraph Perimeter ["Demilitarized Ingress Zone"]
            WAF
        end
        subgraph InternalCluster ["Core Compute VPC"]
            WAF -->|gRPC| App[Application API Fleet]
            App -->|PostgreSQL Wire| DB[(Production Database)]
        end"""

    parsed = engine.parse_mermaid_diagram(diagram)
    assert parsed["format"] == "Mermaid Architecture Diagram"
    assert len(parsed["components"]) >= 3
    assert len(parsed["data_flows"]) >= 2
    assert len(parsed["trust_boundaries"]) >= 1

    comp_names = [c["name"] for c in parsed["components"]]
    assert any("WAF" in n or "Gateway" in n for n in comp_names)
    assert any("Database" in n or "DB" in n for n in comp_names)


def test_openapi_and_iac_parsers_with_security_flaws():
    """Verify OpenAPI and Terraform/Kubernetes IaC parsers detecting security misconfigurations."""
    engine = ThreatModelingEngine()

    # 1. OpenAPI Parser
    openapi_sample = """{
        "info": {"title": "Payment Processing API", "version": "1.0"},
        "paths": {
            "/api/v1/charge": {"post": {}},
            "/api/v1/refund": {"post": {}},
            "/api/v1/balance": {"get": {}}
        }
    }"""
    parsed_api = engine.parse_openapi_spec(openapi_sample)
    assert parsed_api["title"] == "Payment Processing API"
    assert parsed_api["total_endpoints"] == 3
    assert len(parsed_api["components"]) >= 3

    # 2. Terraform IaC Parser with 0.0.0.0/0 flaw
    tf_sample = """
    resource "aws_alb" "external_lb" {
        name = "prod-alb"
    }
    resource "aws_security_group" "open_sg" {
        cidr_blocks = ["0.0.0.0/0"]
    }
    resource "aws_rds_cluster" "main_db" {
        cluster_identifier = "aurora-db"
    }
    """
    parsed_tf = engine.parse_iac_manifest(tf_sample)
    assert parsed_tf["components_discovered"] >= 2
    assert any("0.0.0.0/0" in flaw for flaw in parsed_tf["flaws_detected"])

    # 3. Kubernetes IaC Parser with privileged container flaw
    k8s_sample = """
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: worker-deployment
    spec:
      template:
        spec:
          securityContext:
            privileged: true
            hostPID: true
    """
    parsed_k8s = engine.parse_iac_manifest(k8s_sample)
    assert any("Privileged Container" in flaw for flaw in parsed_k8s["flaws_detected"])


def test_report_and_patch_generation():
    """Verify CISO markdown audit report synthesis and executable patch diff generation."""
    engine = ThreatModelingEngine()
    analysis = engine.analyze_architecture(
        components=[
            {
                "id": "gw",
                "name": "API Gateway",
                "type": "API_GATEWAY",
                "exposure": "PUBLIC",
            },
            {
                "id": "db",
                "name": "Postgres DB",
                "type": "DATA_STORE",
                "exposure": "ISOLATED",
            },
        ]
    )

    report_md = engine.generate_threat_model_report(analysis)
    assert (
        "# 🛡️ SageAI Enterprise Threat Modeling & Security Architecture Audit"
        in report_md
    )
    assert "Cryptographic Merkle Seal" in report_md
    assert "STRIDE Threat Distribution" in report_md

    # Test patch generation
    patch = engine.generate_mitigation_diff("FASTAPI_AUTH_GUARD")
    assert patch["filename"] == "app/core/security.py"
    assert "algorithms=['RS256', 'ES256']" in patch["diff"]


@pytest.mark.asyncio
async def test_threat_modeling_api_routes():
    """Verify FastAPI /threat-modeling endpoints with bearer token authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = create_access_token(
            {"sub": "ciso@enterprise.com", "role": "admin", "org": "corp-grid"}
        )
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 1. Unauthenticated request should be rejected
        unauth_res = await client.get("/threat-modeling/templates")
        assert unauth_res.status_code in (401, 403)

        # 2. Get templates
        tmpl_res = await client.get("/threat-modeling/templates", headers=auth_headers)
        assert tmpl_res.status_code == 200
        assert "templates" in tmpl_res.json()

        # 3. Analyze architecture
        analyze_res = await client.post(
            "/threat-modeling/analyze",
            json={
                "components": [
                    {
                        "id": "c1",
                        "name": "API Gateway",
                        "type": "API_GATEWAY",
                        "exposure": "PUBLIC",
                    },
                    {
                        "id": "c2",
                        "name": "Core Vault",
                        "type": "DATA_STORE",
                        "exposure": "ISOLATED",
                    },
                ]
            },
            headers=auth_headers,
        )
        assert analyze_res.status_code == 200
        data = analyze_res.json()
        assert data["status"] == "SUCCESS"
        assert len(data["threats"]) > 0
        assert "merkle_seal" in data

        # 4. Parse Mermaid diagram
        mermaid_res = await client.post(
            "/threat-modeling/parse-mermaid",
            json={"mermaid_text": "graph TD\nUser --> API[Gateway]"},
            headers=auth_headers,
        )
        assert mermaid_res.status_code == 200
        assert len(mermaid_res.json()["components"]) >= 1

        # 5. Export Report
        export_res = await client.post(
            "/threat-modeling/export-report",
            json={"threat_model": data},
            headers=auth_headers,
        )
        assert export_res.status_code == 200
        assert "markdown_report" in export_res.json()

        # 6. Generate Patch
        patch_res = await client.post(
            "/threat-modeling/generate-patch",
            json={"patch_type": "POSTGRES_RLS_GUARD"},
            headers=auth_headers,
        )
        assert patch_res.status_code == 200
        assert "diff" in patch_res.json()["patch"]
