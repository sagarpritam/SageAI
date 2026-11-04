"""
Unit & Integration Tests for SageAI Automated Threat Modeling Engine (STRIDE + DREAD).
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token
from app.main import app
from app.services.threat_modeling.threat_modeler import (
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


def test_dread_calculation():
    """Verify quantitative DREAD scoring algorithm and severity thresholds."""
    engine = ThreatModelingEngine()

    # Critical threat (score >= 40)
    crit = engine.calculate_dread_score({"damage": 9, "reproducibility": 9, "exploitability": 8, "affected_users": 9, "discoverability": 8})
    assert crit["dread_total"] == 43
    assert crit["dread_average"] == 8.6
    assert crit["severity"] == "CRITICAL"

    # High threat (30 - 39)
    high = engine.calculate_dread_score({"damage": 7, "reproducibility": 7, "exploitability": 6, "affected_users": 7, "discoverability": 6})
    assert high["dread_total"] == 33
    assert high["dread_average"] == 6.6
    assert high["severity"] == "HIGH"

    # Medium threat (20 - 29)
    med = engine.calculate_dread_score({"damage": 5, "reproducibility": 5, "exploitability": 4, "affected_users": 5, "discoverability": 4})
    assert med["dread_total"] == 23
    assert med["dread_average"] == 4.6
    assert med["severity"] == "MEDIUM"

    # Low threat (< 20)
    low = engine.calculate_dread_score({"damage": 3, "reproducibility": 3, "exploitability": 2, "affected_users": 3, "discoverability": 3})
    assert low["dread_total"] == 14
    assert low["dread_average"] == 2.8
    assert low["severity"] == "LOW"


def test_threat_modeling_analysis_and_remediation():
    """Verify STRIDE decomposition, mitigation ticket generation, and Merkle seal."""
    engine = ThreatModelingEngine()
    components = [
        {"id": "comp-1", "name": "Public API Gateway", "type": "API_GATEWAY", "exposure": "PUBLIC"},
        {"id": "comp-2", "name": "Auth Microservice", "type": "CORE_SERVICE", "exposure": "PRIVATE"},
        {"id": "comp-3", "name": "Postgres Database", "type": "DATA_STORE", "exposure": "ISOLATED"},
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

    # Check generated remediation tickets
    tickets = result["remediation_tickets"]
    assert len(tickets) > 0
    first_ticket = tickets[0]
    assert first_ticket["ticket_key"].startswith("SEC-")
    assert first_ticket["priority"] in ["P0", "P1", "P2"]
    assert len(first_ticket["action_items"]) >= 2

    # Check Merkle seal
    merkle = result["merkle_seal"]
    assert merkle["status"] == "CRYPTOGRAPHICALLY_VERIFIED"
    assert len(merkle["record_hash"]) == 64


def test_openapi_and_iac_parsers():
    """Verify OpenAPI and Terraform/Kubernetes IaC parsers."""
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

    # 2. Terraform IaC Parser
    tf_sample = """
    resource "aws_alb" "external_lb" {
        name = "prod-alb"
    }
    resource "aws_rds_cluster" "main_db" {
        cluster_identifier = "aurora-db"
    }
    resource "aws_ecs_service" "app_workers" {
        name = "worker-fleet"
    }
    """
    parsed_tf = engine.parse_iac_manifest(tf_sample)
    assert parsed_tf["components_discovered"] == 3
    names = {c["name"] for c in parsed_tf["components"]}
    assert any("external_lb" in n for n in names)
    assert any("main_db" in n for n in names)


@pytest.mark.asyncio
async def test_threat_modeling_api_routes():
    """Verify FastAPI /threat-modeling endpoints with bearer token authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = create_access_token({"sub": "ciso@enterprise.com", "role": "admin", "org": "corp-grid"})
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
                    {"id": "c1", "name": "API Gateway", "type": "API_GATEWAY", "exposure": "PUBLIC"},
                    {"id": "c2", "name": "Core Vault", "type": "DATA_STORE", "exposure": "ISOLATED"},
                ]
            },
            headers=auth_headers,
        )
        assert analyze_res.status_code == 200
        data = analyze_res.json()
        assert data["status"] == "SUCCESS"
        assert len(data["threats"]) > 0
        assert "merkle_seal" in data

