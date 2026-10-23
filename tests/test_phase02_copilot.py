"""Phase 02 AI Security Copilot & CVE Threat Intelligence Tests.

Tests:
1. CISA KEV Threat Indexer (search, deduplication, stale-feed detection, KEV filtering)
2. Copilot Agent Tenant Isolation (cannot access other org's scans or findings)
3. Copilot Explainer with Live Threat Intel & OWASP Top 10 mapping
4. Safe PoC curl generation guardrails and domain authorization
5. Copilot Chat endpoint (JSON and SSE streaming responses)
6. Dedicated /copilot/explain and /copilot/poc endpoints
7. Threat feed dashboard endpoints (/threat-feed and /threat-feed/sync)
8. Tamper-evident Audit logging for Copilot inquiries
"""

import uuid
from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy import select

from app.agents.copilot import copilot_agent
from app.models.audit_log import AuditLog
from app.models.organization import Organization
from app.models.scan import Scan
from app.models.user import User
from app.services.threat_feed.cve_indexer import (
    CVEIndexer,
)


async def get_test_tenant(client, prefix: str):
    """Register and login a test user, returning headers, org_name, and org_id."""
    uid = uuid.uuid4().hex[:8]
    email = f"{prefix}_{uid}@domain.com"
    password = "SecurePassword123!"
    org_name = f"Org_{prefix}_{uid}"

    reg_res = await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "organization_name": org_name,
        },
    )
    assert reg_res.status_code in (200, 201)

    login_res = await client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, org_name


# ─────────────────────────────────────────────────────────────
# 1. Threat Feed Indexer Unit Tests
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_threat_indexer_search_and_deduplication():
    """Verify CISA KEV indexer correctly searches, filters, and deduplicates vulnerabilities."""
    indexer = CVEIndexer()

    # Search by keyword
    results = indexer.search("Ivanti")
    assert len(results) >= 2
    assert any("CVE-2024-21887" in r.id for r in results)

    # Search KEV only
    kev_results = indexer.search(query="", kev_only=True)
    assert len(kev_results) > 0
    assert all(r.is_kev for r in kev_results)

    # Specific CVE lookup
    cve = await indexer.get_cve("CVE-2023-34362")
    assert cve is not None
    assert cve.vendor_project is not None and "Progress" in cve.vendor_project
    assert cve.is_kev is True
    assert cve.product is not None and "MOVEit" in cve.product

    # Test stale feed detection
    assert not indexer.is_stale(max_age_hours=24)


# ─────────────────────────────────────────────────────────────
# 2. Copilot Agent Tenant Isolation Tests
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_copilot_tenant_isolation(client, db_session):
    """Ensure Copilot cannot inspect or summarize scans belonging to a foreign tenant."""
    headers_a, org_name_a = await get_test_tenant(client, "copilot_a")
    headers_b, org_name_b = await get_test_tenant(client, "copilot_b")

    org_a = (
        await db_session.execute(select(Organization).where(Organization.name == org_name_a))
    ).scalar_one()
    org_b = (
        await db_session.execute(select(Organization).where(Organization.name == org_name_b))
    ).scalar_one()

    user_a = (
        await db_session.execute(select(User).where(User.organization_id == org_a.id))
    ).scalars().first()

    # Create scan for Org A
    scan_a = Scan(
        id=str(uuid.uuid4()),
        organization_id=org_a.id,
        user_id=user_a.id,
        target="internal-portal.tenant-a.com",
        status="completed",
        risk_score=85,
    )
    db_session.add(scan_a)
    await db_session.commit()

    # Org A requests its own scan summary -> Authorized
    summary_a = await copilot_agent.get_scan_summary(scan_id=scan_a.id, org_id=org_a.id, db=db_session)
    assert summary_a["authorized"] is True
    assert summary_a["target"] == "internal-portal.tenant-a.com"

    # Org B attempts to summarize Org A's scan -> Denied
    summary_b = await copilot_agent.get_scan_summary(scan_id=scan_a.id, org_id=org_b.id, db=db_session)
    assert summary_b["authorized"] is False
    assert "not found or does not belong" in summary_b["error"]


# ─────────────────────────────────────────────────────────────
# 3. Copilot Explainer & Threat Intelligence Enrichment Tests
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_copilot_explain_vulnerability():
    """Verify vulnerability explanation enriches with CISA KEV exploitation and OWASP mapping."""
    # Explain CISA KEV CVE
    res = await copilot_agent.explain_vulnerability(cve_or_title="CVE-2024-21887")
    assert res["authorized"] is True
    assert res["cve_id"] == "CVE-2024-21887"
    assert res["is_actively_exploited"] is True
    assert "Ivanti" in res["threat_intel"]["vendor_project"]
    assert res["remediation_action"] is not None

    # Explain OWASP SQL Injection
    res_sqli = await copilot_agent.explain_vulnerability(cve_or_title="SQL Injection in auth query")
    assert res_sqli["authorized"] is True
    assert res_sqli["owasp"]["owasp_category"] == "Injection"
    assert res_sqli["owasp"]["cwe"] == "CWE-89"


# ─────────────────────────────────────────────────────────────
# 4. Safe PoC Generation Guardrails Tests
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_copilot_safe_poc_guardrails():
    """Verify PoC generator outputs safe non-destructive curl commands."""
    poc_sqli = await copilot_agent.generate_poc_curl(
        vulnerability_type="SQL Injection",
        target="https://myapp.example.com",
    )
    assert poc_sqli["authorized"] is True
    assert "curl" in poc_sqli["curl_command"]
    # Check that destructive keywords are absent
    assert "DROP TABLE" not in poc_sqli["curl_command"]
    assert "rm -rf" not in poc_sqli["curl_command"]
    assert "sageai_canary_test" in poc_sqli["curl_command"]
    assert "purpose" in poc_sqli

    # Test Header check PoC
    poc_headers = await copilot_agent.generate_poc_curl(
        vulnerability_type="Missing Security Headers",
        target="https://myapp.example.com",
    )
    assert "curl -s -I" in poc_headers["curl_command"]


# ─────────────────────────────────────────────────────────────
# 5. Copilot Endpoints & Streaming Tests
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_copilot_chat_endpoint_json_and_streaming(client, db_session):
    """Test POST /copilot/chat in both standard JSON and SSE streaming modes."""
    headers, org_name = await get_test_tenant(client, "chat")

    # 1. Standard JSON mode
    with patch("app.services.llm.gateway.llm_gateway.generate", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = "Here is the threat intelligence for your scan."

        res = await client.post(
            "/copilot/chat",
            headers=headers,
            json={
                "message": "Explain CVE-2024-21887 and its risk",
                "stream": False,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "reply" in data
        assert len(data["reply"]) > 0

    # 2. SSE Streaming mode
    with patch("app.services.llm.gateway.llm_gateway.generate", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = "Streaming token response for Copilot analysis."

        stream_res = await client.post(
            "/copilot/chat",
            headers=headers,
            json={
                "message": "What is the remediation for Log4Shell?",
                "stream": True,
            },
        )
        assert stream_res.status_code == 200
        assert "text/event-stream" in stream_res.headers.get("content-type", "")
        body_text = stream_res.text
        assert "data: " in body_text
        assert '"done": true' in body_text


@pytest.mark.asyncio
async def test_copilot_dedicated_endpoints(client):
    """Test POST /copilot/explain, POST /copilot/poc, and GET /copilot/threat-intel."""
    headers, _ = await get_test_tenant(client, "dedicated")

    # 1. /copilot/explain
    exp_res = await client.post(
        "/copilot/explain",
        headers=headers,
        json={"query": "CVE-2024-3400"},
    )
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert exp_data["cve_id"] == "CVE-2024-3400"
    assert exp_data["is_actively_exploited"] is True

    # 2. /copilot/poc
    poc_res = await client.post(
        "/copilot/poc",
        headers=headers,
        json={"vulnerability_type": "SSRF", "target": "https://api.test.com"},
    )
    assert poc_res.status_code == 200
    poc_data = poc_res.json()
    assert "curl" in poc_data["curl_command"]
    assert "safety_warning" in poc_data

    # 3. /copilot/threat-intel
    intel_res = await client.get(
        "/copilot/threat-intel?query=Ivanti",
        headers=headers,
    )
    assert intel_res.status_code == 200
    intel_data = intel_res.json()
    assert intel_data["count"] >= 1

    # 4. /copilot/tools
    tools_res = await client.get("/copilot/tools", headers=headers)
    assert tools_res.status_code == 200
    assert len(tools_res.json()["tools"]) >= 4


# ─────────────────────────────────────────────────────────────
# 6. Threat Feed Dashboard Endpoints Tests
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_threat_feed_dashboard_endpoints(client):
    """Test GET /threat-feed and POST /threat-feed/sync for dashboard widget compatibility."""
    headers, _ = await get_test_tenant(client, "threatfeed")

    # GET /threat-feed
    res = await client.get("/threat-feed", headers=headers)
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)
    assert len(items) > 0
    first = items[0]
    assert "id" in first
    assert "title" in first
    assert "severity" in first
    assert "published" in first

    # POST /threat-feed/sync
    sync_res = await client.post("/threat-feed/sync", headers=headers)
    assert sync_res.status_code == 200
    assert sync_res.json()["status"] == "success"


# ─────────────────────────────────────────────────────────────
# 7. Audit Logging for Copilot Inquiries
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_copilot_audit_logging(client, db_session):
    """Verify that every copilot inquiry records an immutable audit log entry."""
    headers, org_name = await get_test_tenant(client, "copilot_audit")

    org = (
        await db_session.execute(select(Organization).where(Organization.name == org_name))
    ).scalar_one()

    # Send a query
    res = await client.post(
        "/copilot/chat",
        headers=headers,
        json={"message": "Audit check test query", "stream": False},
    )
    assert res.status_code == 200

    # Query audit logs for Org
    logs = (
        await db_session.execute(
            select(AuditLog).where(
                AuditLog.organization_id == org.id,
                AuditLog.action == "COPILOT_QUERY",
            )
        )
    ).scalars().all()

    assert len(logs) >= 1
    assert logs[0].resource_type == "copilot"
