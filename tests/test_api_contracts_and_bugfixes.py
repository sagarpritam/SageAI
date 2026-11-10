"""API Contract, OpenAPI Schema, Static-Analysis Bugfix, and Regression Tests.

Validates:
- Unique OpenAPI 3.1 operationIds (no /export GET+POST duplicate warning)
- /health and /health/ready readiness contracts
- /incidents/ingest cryptographic audit chain sealing
- /ai/command handling dict current_user
- ThreatPatternSynthesizer + CVEIndexer + DeceptionHoneypotService contracts
- SAML ACS multiline NameID extraction & DTD/ENTITY XXE rejection
- SSLPlugin & ReconAgent asyncio.to_thread sync wrappers
- /integrations/github/setup accepting both {"token"} and {"pat"} plus /org/audit-logs shape
"""

import base64
import json
import sys
import types
import uuid
import warnings
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest

from app.main import app
from app.plugins.ssl_plugin import SSLPlugin
from app.services.agent.recon_agent import ReconAgent
from app.services.audit_chain import audit_chain
from app.services.deception.honeypot_service import DeceptionHoneypotService
from app.services.threat_feed.cve_indexer import CVEIndexer
from app.services.threat_feed.pattern_synthesizer import ThreatPatternSynthesizer


async def _register_and_login_admin(client, prefix: str) -> dict[str, str]:
    uid = uuid.uuid4().hex[:8]
    email = f"{prefix}_{uid}@sageai-test.com"
    password = "SecurePassword123!"
    reg_res = await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "organization_name": f"ContractOrg_{prefix}_{uid}",
        },
    )
    assert reg_res.status_code == 201
    login_res = await client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_openapi_schema_has_no_duplicate_operation_ids():
    """FastAPI OpenAPI schema must contain unique operationIds across all routes."""
    app.openapi_schema = None
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        spec = app.openapi()

    dup_warnings = [
        str(w.message) for w in caught if "Duplicate Operation ID" in str(w.message)
    ]
    assert dup_warnings == [], f"Unexpected OpenAPI duplicate warnings: {dup_warnings}"

    assert len(spec["paths"]) >= 600
    operation_ids: list[str] = [
        op["operationId"]
        for path_item in spec["paths"].values()
        for op in path_item.values()
        if isinstance(op, dict) and "operationId" in op
    ]
    assert len(operation_ids) == len(set(operation_ids))

    export_ops = spec["paths"]["/export"]
    assert "get" in export_ops and "post" in export_ops
    assert export_ops["get"]["operationId"] != export_ops["post"]["operationId"]


@pytest.mark.asyncio
async def test_health_endpoints_contract(client):
    """Health and readiness probes return database and pool telemetry."""
    res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "database_pool" in data

    ready_res = await client.get("/health/ready")
    assert ready_res.status_code == 200
    ready_data = ready_res.json()
    assert ready_data["status"] == "healthy"
    assert ready_data["database"] == "connected"
    assert "pool" in ready_data


@pytest.mark.asyncio
async def test_incident_ingest_seals_audit_chain(client, auth_headers):
    """Ingesting an alert seals a verifiable block into the cryptographic audit chain."""
    before_count = audit_chain.verify_chain_integrity()["total_records"]

    res = await client.post(
        "/incidents/ingest",
        json={
            "title": "Contract Verification Alert",
            "severity": "HIGH",
            "source": "ContractTest",
            "details": {"ip": "198.51.100.10"},
        },
        headers=auth_headers,
    )
    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "success"
    incident_id = body["incident"]["incident_id"]

    integrity = audit_chain.verify_chain_integrity()
    assert integrity["valid"] is True
    assert integrity["total_records"] >= before_count + 1
    assert any(
        entry.get("action") == "INCIDENT_INGESTED"
        and entry.get("details", {}).get("incident_id") == incident_id
        for entry in audit_chain._ledger
    )


@pytest.mark.asyncio
async def test_ai_command_accepts_dict_current_user(client, auth_headers):
    """POST /ai/command extracts org cleanly from dict current_user and rejects blanks."""
    bad_res = await client.post(
        "/ai/command",
        json={"command": "   ", "target": "https://example.com"},
        headers=auth_headers,
    )
    assert bad_res.status_code == 400

    mock_payload = {
        "target": "https://example.com",
        "prompt": "Check SSL posture",
        "selected_tools": ["ssl_scanner"],
        "raw_results": {"ssl_scanner": []},
        "vulnerabilities": [],
        "executive_summary": "No issues detected.",
    }
    with patch(
        "app.services.agent.orchestrator.AgentOrchestrator.execute_task",
        new=AsyncMock(return_value=mock_payload),
    ) as mocked_exec:
        ok_res = await client.post(
            "/ai/command",
            json={"command": "Check SSL posture", "target": "https://example.com"},
            headers=auth_headers,
        )
    assert ok_res.status_code == 200
    assert ok_res.json()["executive_summary"] == "No issues detected."
    mocked_exec.assert_awaited_once()


def test_threat_pattern_synthesizer_and_deception_scoping(tmp_path):
    """CVEIndexer, ThreatPatternSynthesizer, and org-scoped canary token listing work coherently."""
    indexer = CVEIndexer(cache_path=tmp_path / "cve_cache.json")
    vuln = indexer.get_by_id("CVE-2024-21887")
    assert vuln is not None
    assert vuln.is_kev is True

    synthesizer = ThreatPatternSynthesizer(rules_dir=tmp_path / "rules")
    bundle = synthesizer.synthesize_from_cve_id("CVE-2024-21887")
    assert bundle["cve_id"] == "CVE-2024-21887"
    assert synthesizer.validate_rule("yara", bundle["yara_rule"])["valid"] is True
    assert (
        synthesizer.validate_rule("nuclei", bundle["nuclei_template"])["valid"] is True
    )

    deception = DeceptionHoneypotService()
    token_a = deception.generate_canary_token(
        token_type="api_key", label="Org A Trap", org_id="org-a"
    )
    token_b = deception.generate_canary_token(
        token_type="aws_key", label="Org B Trap", org_id="org-b"
    )

    org_a_tokens = deception.list_canary_tokens(org_id="org-a")
    org_b_tokens = deception.list_canary_tokens(org_id="org-b")
    assert [t["token_id"] for t in org_a_tokens] == [token_a["token_id"]]
    assert [t["token_id"] for t in org_b_tokens] == [token_b["token_id"]]
    assert len(deception.list_canary_tokens()) == 2


@pytest.mark.asyncio
async def test_saml_acs_multiline_nameid_and_xxe_rejection(client):
    """SAML ACS extracts multiline NameID without XML ElementTree and rejects DTD/ENTITY."""
    uid = uuid.uuid4().hex[:8]
    email = f"sso_{uid}@sageai.internal"
    saml_xml = f"""
    <samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
        <saml:Assertion>
            <saml:Subject>
                <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
                    {email}
                </saml:NameID>
            </saml:Subject>
        </saml:Assertion>
    </samlp:Response>
    """.strip()
    saml_b64 = base64.b64encode(saml_xml.encode("utf-8")).decode("utf-8")

    res = await client.post("/auth/sso/saml/acs", json={"SAMLResponse": saml_b64})
    assert res.status_code == 200
    assert res.json().get("access_token")

    xxe_xml = """<?xml version="1.0"?>
    <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
    <samlp:Response><saml:NameID>xxe@sageai.internal</saml:NameID></samlp:Response>
    """
    xxe_b64 = base64.b64encode(xxe_xml.encode("utf-8")).decode("utf-8")
    xxe_res = await client.post("/auth/sso/saml/acs", json={"SAMLResponse": xxe_b64})
    assert xxe_res.status_code == 400
    assert "DOCTYPE" in xxe_res.json()["detail"]


@pytest.mark.asyncio
async def test_ssl_plugin_and_recon_agent_sync_wrappers():
    """SSLPlugin and ReconAgent cleanly offload sync scanners via asyncio.to_thread."""
    sample_ssl = [{"type": "ssl_valid", "severity": "info", "detail": "Valid 90d"}]
    with patch("app.plugins.ssl_plugin.scan_ssl", return_value=sample_ssl) as mock_ssl:
        plugin_result = await SSLPlugin().run("https://example.com")

    assert plugin_result.plugin_name == "ssl_tls"
    assert plugin_result.findings == sample_ssl
    mock_ssl.assert_called_once_with("example.com")

    sample_dns = [{"type": "dns_resolution", "severity": "info", "detail": "1.2.3.4"}]
    with (
        patch(
            "app.services.agent.recon_agent.crtsh_client.search_certificates",
            new=AsyncMock(return_value=[]),
        ),
        patch(
            "app.services.agent.recon_agent.dns_scanner.scan_dns",
            return_value=sample_dns,
        ) as mock_dns,
        patch(
            "app.services.agent.recon_agent.socket.gethostbyname",
            return_value="93.184.216.34",
        ),
        patch(
            "app.services.agent.recon_agent.shodan_client.lookup_ip",
            new=AsyncMock(return_value=[]),
        ),
        patch(
            "app.services.agent.recon_agent.llm_gateway.generate",
            new=AsyncMock(
                return_value='{"total_hosts": 1, "interesting_hosts": ["example.com"], "infrastructure_summary": "OK", "attack_surface_rating": "Small", "recon_flags": []}'
            ),
        ),
    ):
        recon_res = await ReconAgent().run("https://example.com")

    assert recon_res["target"] == "example.com"
    assert recon_res["dns_findings"] == sample_dns
    mock_dns.assert_called_once_with("example.com")


@pytest.mark.asyncio
async def test_github_setup_pat_and_token_plus_audit_logs_contract(client):
    """GitHub setup accepts both {pat} and {token}, rejects blank, and /org/audit-logs matches UI contract."""
    admin_headers = await _register_and_login_admin(client, "gh_audit")

    # Reject empty payload cleanly
    empty_res = await client.post(
        "/integrations/github/setup", json={}, headers=admin_headers
    )
    assert empty_res.status_code == 422

    # Accept legacy {pat} payload (used prior to frontend proxy normalization)
    pat_res = await client.post(
        "/integrations/github/setup",
        json={"pat": "ghp_contract_pat_123"},
        headers=admin_headers,
    )
    assert pat_res.status_code == 200

    # Accept canonical {token} payload
    tok_res = await client.post(
        "/integrations/github/setup",
        json={"token": "ghp_contract_token_456"},
        headers=admin_headers,
    )
    assert tok_res.status_code == 200

    status_res = await client.get("/integrations/github/status", headers=admin_headers)
    assert status_res.status_code == 200
    assert status_res.json()["has_github_token"] is True

    # Generate an org audit log entry and verify response shape matches AuditLog.tsx expectations
    patch_res = await client.patch(
        "/org/policy",
        json={"require_verified_domains": True},
        headers=admin_headers,
    )
    assert patch_res.status_code == 200

    audit_res = await client.get("/org/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    entries = audit_res.json()
    assert isinstance(entries, list) and len(entries) >= 1
    first = entries[0]
    assert first["id"] is not None
    assert isinstance(first["action"], str)
    assert isinstance(first["details"], dict)
    assert "created_at" in first


def test_warroom_fallback_event_and_singleton():
    """_FallbackEvent serializes both Enum and raw scalar type/priority and WarRoomManager is a singleton."""
    from app.services.warroom_service import (
        WarRoomManager,
        _FallbackEvent,
        _FallbackEventPriority,
        _FallbackEventType,
    )

    now = datetime.now(timezone.utc)
    enum_evt = _FallbackEvent(
        id="evt-enum",
        type=_FallbackEventType.TELEMETRY,
        source="WarRoomTest",
        timestamp=now,
        priority=_FallbackEventPriority.CRITICAL,
        payload={"ok": True},
        target="https://example.com",
    )
    assert enum_evt.to_dict()["type"] == "telemetry"
    assert enum_evt.to_dict()["priority"] == 4

    raw_evt = _FallbackEvent(
        id="evt-raw",
        type="telemetry",  # type: ignore[arg-type]
        source="WarRoomTest",
        timestamp=now,
        priority="3",  # type: ignore[arg-type]
        payload={},
    )
    assert raw_evt.to_dict()["type"] == "telemetry"
    assert raw_evt.to_dict()["priority"] == 3

    mgr_a = WarRoomManager()
    mgr_b = WarRoomManager()
    assert mgr_a is mgr_b
    assert mgr_a._initialized is True


@pytest.mark.asyncio
async def test_sagestrike_event_bus_and_exploit_framework_guards():
    """EventBus._ensure_topics rejects unconnected kafka_admin and ExploitFramework validates RPC URL safely."""
    kafka_stub = types.SimpleNamespace(
        KafkaConsumer=object,
        KafkaProducer=object,
    )
    kafka_admin_stub = types.SimpleNamespace(
        KafkaAdminClient=object,
        NewTopic=object,
    )
    with patch.dict(
        sys.modules,
        {"kafka": kafka_stub, "kafka.admin": kafka_admin_stub},
    ):
        from sagestrike.event_bus import EventBus

        bus = EventBus(
            kafka_brokers=["localhost:9092"],
            redis_url="redis://localhost:6379",
            service_name="test-bus",
        )
        with pytest.raises(RuntimeError, match="Kafka admin client not connected"):
            await bus._ensure_topics()
        sys.modules.pop("sagestrike.event_bus", None)

    from sagestrike.exploit_engine import ExploitFramework

    fw_ok = ExploitFramework(msf_rpc_url="https://msf.internal:55553/api/")
    assert fw_ok.msf_client == {
        "rpc_url": "https://msf.internal:55553/api/",
        "transport": "msgpack-http",
    }

    fw_bad = ExploitFramework(msf_rpc_url="ftp://untrusted.local/xml")
    assert fw_bad.msf_client is None


def test_nitro_attestation_rejects_malformed_pcr_types():
    """verify_nitro_attestation handles non-string pcrs['0'] or non-dict pcrs without crashing."""
    from app.services.enclave_attestation.hardware_attestation_service import (
        HardwareEnclaveAttestationService,
    )

    svc = HardwareEnclaveAttestationService()
    for bad_payload in (
        {"module_id": "enc-bad-int", "pcrs": {"0": 12345, "1": "abc"}},
        {"module_id": "enc-bad-none", "pcrs": None},
    ):
        b64_doc = base64.b64encode(json.dumps(bad_payload).encode("utf-8")).decode(
            "utf-8"
        )
        res = svc.verify_nitro_attestation(b64_doc)
        assert res["valid"] is False
        assert res["pcr_results"]["pcr0_valid"] is False


@pytest.mark.asyncio
async def test_verify_nvidia_live_handles_none_and_empty_key(monkeypatch):
    """audit_nvidia_nim_live cleanly skips instead of raising AttributeError when API key is None."""
    from scripts import verify_nvidia_live

    monkeypatch.delenv("NVIDIA_API_KEY", raising=False)
    monkeypatch.setattr(verify_nvidia_live.settings, "NVIDIA_API_KEY", None)

    res = await verify_nvidia_live.audit_nvidia_nim_live(None)
    assert res["status"] == "SKIPPED"
    assert res["passed"] is True
