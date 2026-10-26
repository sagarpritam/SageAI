"""Phase 05 Observability, Distributed Tracing, Operations Metrics, and DAST Tests.

Tests:
1. W3C traceparent and X-Trace-ID context propagation across HTTP requests.
2. Trace span recording and waterfall retrieval (GET /telemetry/traces/{id}).
3. Real-time operations and reliability metrics (GET /metrics/operations).
4. Threat feed freshness and stale alert threshold evaluation.
5. Two-tier DAST verification:
   - Safe passive baseline scan (headers, cookies, disclosures)
   - Authorization gate: rejection of active probes on unauthorized targets (403 Forbidden)
   - Controlled active probe execution on authorized staging assets
"""

import time
import uuid
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.core.telemetry import (
    TraceSpan,
    generate_span_id,
    generate_trace_id,
    parse_traceparent,
    record_child_span,
    trace_storage,
)
from app.services.dast.zap_scanner import DASTAuthorizationError, StagedDASTScanner
from app.services.monitoring.metrics_service import (
    compute_percentiles,
    record_alert_dispatch_timing,
    record_feed_sync_timestamp,
)


async def get_test_tenant(client, prefix: str):
    """Register and login a test user, returning auth headers and org_name."""
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
# 1. Distributed Tracing & W3C Context Propagation Tests
# ─────────────────────────────────────────────────────────────


def test_traceparent_header_parsing():
    """Verify standard W3C traceparent header parser."""
    valid_header = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
    parsed = parse_traceparent(valid_header)
    assert parsed is not None
    trace_id, parent_id = parsed
    assert trace_id == "4bf92f3577b34da6a3ce929d0e0e4736"
    assert parent_id == "00f067aa0ba902b7"

    # Malformed headers
    assert parse_traceparent("invalid") is None
    assert parse_traceparent("01-short-short-01") is None
    assert parse_traceparent("") is None


@pytest.mark.asyncio
async def test_trace_context_propagation_in_http_pipeline(client):
    """Ensure API requests propagate trace ID to response headers and telemetry ring buffer."""
    custom_trace_id = generate_trace_id()
    client_span_id = generate_span_id()
    w3c_header = f"00-{custom_trace_id}-{client_span_id}-01"

    res = await client.get("/health", headers={"traceparent": w3c_header})
    assert res.status_code == 200
    assert res.headers.get("X-Trace-ID") == custom_trace_id
    assert f"00-{custom_trace_id}-" in res.headers.get("traceparent")

    # Verify trace span in storage
    spans = trace_storage.get_trace(custom_trace_id)
    assert spans is not None
    assert len(spans) >= 1
    root = spans[0]
    assert root["trace_id"] == custom_trace_id
    assert root["parent_span_id"] == client_span_id
    assert root["name"] == "HTTP GET /health"
    assert root["status"] == "ok"


@pytest.mark.asyncio
async def test_trace_waterfall_endpoints(client):
    """GET /telemetry/traces and GET /telemetry/traces/{id} return span waterfall."""
    headers, _ = await get_test_tenant(client, "trace_user")

    # Generate a trace with nested spans
    test_trace_id = generate_trace_id()
    root_span = TraceSpan(
        span_id=generate_span_id(),
        trace_id=test_trace_id,
        parent_span_id=None,
        name="HTTP POST /scan",
        start_time=time.time() - 0.2,
        end_time=time.time(),
        duration_ms=200.0,
        status="ok",
        attributes={"http.target": "/scan"},
    )
    trace_storage.record_span(root_span)

    # Child worker span
    record_child_span(
        name="Worker: Ephemeral Scanner (Nmap)",
        duration_ms=150.0,
        status="ok",
        parent_span_id=root_span.span_id,
        trace_id=test_trace_id,
    )

    # 1. Query trace list
    list_res = await client.get("/telemetry/traces", headers=headers)
    assert list_res.status_code == 200
    data = list_res.json()
    assert "traces" in data
    assert any(t["trace_id"] == test_trace_id for t in data["traces"])

    # 2. Query trace detail waterfall
    detail_res = await client.get(f"/telemetry/traces/{test_trace_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["trace_id"] == test_trace_id
    assert detail["span_count"] >= 2
    span_names = [s["name"] for s in detail["spans"]]
    assert "HTTP POST /scan" in span_names
    assert "Worker: Ephemeral Scanner (Nmap)" in span_names


# ─────────────────────────────────────────────────────────────
# 2. Operations & Reliability Metrics Tests
# ─────────────────────────────────────────────────────────────


def test_compute_percentiles():
    """Verify percentile calculation for SLA reporting."""
    samples = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100.0]
    p = compute_percentiles(samples)
    assert p["p50"] == 60.0
    assert p["p95"] == 100.0
    assert p["p99"] == 100.0


@pytest.mark.asyncio
async def test_operational_scorecard_endpoint(client, db_session):
    """GET /metrics/operations returns fleet backlog, alert SLA, threat freshness, and SagePatch velocity."""
    headers, _ = await get_test_tenant(client, "ops_metrics")

    # Seed an alert timing and feed timestamp
    record_alert_dispatch_timing(120.0)
    record_feed_sync_timestamp(time.time() - 7200)  # 2 hours ago

    res = await client.get("/metrics/operations", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "scan_fleet" in data
    assert "backlog_depth" in data["scan_fleet"]
    assert "broker_connected" in data["scan_fleet"]

    assert "alert_operations" in data
    assert "p95_latency_ms" in data["alert_operations"]
    assert data["alert_operations"]["sla_compliant"] is True

    assert "threat_feed_intel" in data
    assert data["threat_feed_intel"]["is_stale"] is False  # 2 hours < 24 hours

    assert "remediation_velocity" in data
    assert "pending_approval" in data["remediation_velocity"]


def test_threat_feed_staleness_detection():
    """Feeds older than 24 hours are marked stale with a warning status."""
    stale_ts = time.time() - (25 * 3600)  # 25 hours ago
    record_feed_sync_timestamp(stale_ts)

    from app.services.monitoring.metrics_service import _LAST_FEED_SYNC_TIME

    hours_since = (time.time() - _LAST_FEED_SYNC_TIME) / 3600.0
    assert hours_since >= 24.0


# ─────────────────────────────────────────────────────────────
# 3. Two-Tier DAST Scanner Tests (Passive Baseline & Staging Active)
# ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_dast_passive_baseline_scan():
    """Passive DAST scan identifies missing security headers and technology banners."""
    scanner = StagedDASTScanner()

    mock_resp = httpx.Response(
        status_code=200,
        headers={
            "content-type": "text/html",
            "server": "Apache/2.4.41 (Ubuntu)",
            "set-cookie": "session_id=abc12345; path=/",  # Insecure cookie
        },
        content=b"<html><body><h1>Staging App</h1></body></html>",
    )

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_resp

        result = await scanner.scan_target(
            target_url="https://app.staging.example.com",
            is_authorized_staging=False,
            mode="passive",
        )

        assert result["status"] == "completed"
        assert result["mode"] == "passive"
        findings = result["findings"]
        assert len(findings) > 0

        finding_types = [f["type"] for f in findings]
        assert "dast_missing_header" in finding_types
        assert "dast_info_disclosure" in finding_types
        assert "dast_cookie_security" in finding_types


@pytest.mark.asyncio
async def test_dast_active_mode_authorization_gate():
    """Active DAST probing is strictly rejected on unauthorized targets (raises DASTAuthorizationError)."""
    scanner = StagedDASTScanner()

    with pytest.raises(DASTAuthorizationError) as exc_info:
        await scanner.scan_target(
            target_url="https://production.client.com",
            is_authorized_staging=False,
            mode="active",
        )
    assert "not an authorized staging asset" in str(exc_info.value)


@pytest.mark.asyncio
async def test_dast_active_mode_on_authorized_staging_asset():
    """Controlled active probe runs on verified staging assets and detects sensitive files."""
    scanner = StagedDASTScanner()

    def mock_routing(url, **kwargs):
        url_str = str(url)
        if "/.env" in url_str:
            return httpx.Response(200, content=b"DB_PASSWORD=secret_pass_123")
        elif "sageai_safe_test_canary_1234" in url_str:
            return httpx.Response(200, content=b"Search: sageai_safe_test_canary_1234")
        return httpx.Response(404, content=b"Not found")

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = mock_routing

        result = await scanner.scan_target(
            target_url="https://staging.internal.net",
            is_authorized_staging=True,
            mode="active",
        )

        assert result["status"] == "completed"
        assert result["mode"] == "active"
        assert result["active_probes_executed"] > 0
        finding_types = [f["type"] for f in result["findings"]]
        assert "dast_exposed_file" in finding_types
        assert "dast_reflected_param" in finding_types


@pytest.mark.asyncio
async def test_dast_api_endpoint_authorization_enforcement(client):
    """POST /dast/scan returns 403 Forbidden when active mode is requested without authorization."""
    headers, _ = await get_test_tenant(client, "dast_api")

    # Unauthorized active probe -> 403
    res_denied = await client.post(
        "/dast/scan",
        headers=headers,
        json={
            "target": "https://unauthorized-domain.com",
            "mode": "active",
            "is_authorized": False,
        },
    )
    assert res_denied.status_code == 403
    assert "not an authorized staging asset" in res_denied.json()["detail"]

    # Authorized passive scan -> 200
    with patch(
        "app.services.dast.zap_scanner.StagedDASTScanner.scan_target",
        new_callable=AsyncMock,
    ) as mock_scan:
        mock_scan.return_value = {
            "status": "completed",
            "target": "https://staging.authorized.com",
            "mode": "passive",
            "findings_count": 2,
            "findings": [{"title": "Missing HSTS", "type": "dast_missing_header"}],
        }

        res_ok = await client.post(
            "/dast/scan",
            headers=headers,
            json={
                "target": "https://staging.authorized.com",
                "mode": "passive",
                "is_authorized": True,
            },
        )
        assert res_ok.status_code == 200
        assert res_ok.json()["status"] == "completed"
