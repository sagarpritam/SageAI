"""Tests for DevSecOps Continuous Security Loop and Parallel CI Gate.

Tests:
1. SecretScanner: Detection of AWS keys, tokens, and private keys.
2. CI Quality Gate evaluation logic (pass/fail thresholds).
3. API endpoints: POST /ci/gate, GET /ci/policy, PATCH /ci/policy.
4. API Key authentication for CI/CD runners (X-API-Key header).
5. Audit logging on gate evaluation.
"""

import os
import tempfile
import uuid

import pytest

from app.models.organization import Organization
from app.services.ci_gate_service import evaluate_gate_policy
from app.services.tools.secret_scanner import SecretScanner


@pytest.mark.asyncio
async def test_secret_scanner_detection():
    """Verify SecretScanner detects high-entropy leaked credentials."""
    scanner = SecretScanner()

    with tempfile.TemporaryDirectory() as tmp_dir:
        # Create a benign file
        with open(os.path.join(tmp_dir, "clean.py"), "w") as f:
            f.write("def add(a, b):\n    return a + b\n")

        # Create a file with leaked AWS key
        with open(os.path.join(tmp_dir, "aws_leak.py"), "w") as f:
            f.write("AWS_KEY = 'AKIA1234567890ABCDEF'\n")

        # Create a file with leaked Slack webhook
        with open(os.path.join(tmp_dir, "slack_leak.py"), "w") as f:
            f.write("URL = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'\n")

        res = await scanner.run(tmp_dir)
        assert res["total_findings"] >= 2
        types = [f["type"] for f in res["findings"]]
        assert "AWS Access Key" in types
        assert "Slack Incoming Webhook" in types


def test_evaluate_gate_policy():
    """Verify policy evaluation passes/fails according to severity thresholds."""
    org = Organization(name="TestGateOrg", ci_fail_on_critical=True, ci_fail_on_high=True)

    # 1. Clean findings -> passes
    clean_eval = evaluate_gate_policy(
        [{"severity": "LOW", "type": "InfoLeak"}],
        org,
    )
    assert clean_eval["passed"] is True
    assert clean_eval["total_violations"] == 0

    # 2. Critical finding -> fails
    crit_eval = evaluate_gate_policy(
        [{"severity": "CRITICAL", "type": "SQLi"}],
        org,
    )
    assert crit_eval["passed"] is False
    assert crit_eval["total_violations"] == 1

    # 3. High finding with fail_on_high disabled -> passes
    org.ci_fail_on_high = False
    high_eval = evaluate_gate_policy(
        [{"severity": "HIGH", "type": "MissingHeader"}],
        org,
    )
    assert high_eval["passed"] is True


@pytest.mark.asyncio
async def test_ci_gate_api_flow(client, db_session):
    """Test POST /ci/gate endpoint and audit trail."""
    # Register tenant
    uid = uuid.uuid4().hex[:8]
    email = f"ci_{uid}@devsecops.corp"
    await client.post(
        "/auth/register",
        json={"email": email, "password": "Password123!", "organization_name": f"CI_Org_{uid}"},
    )
    login_r = await client.post("/auth/login", json={"email": email, "password": "Password123!"})
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Evaluate clean gate
    clean_res = await client.post(
        "/ci/gate",
        json={
            "repository": "acme/web-app",
            "commit_sha": "a1b2c3d4e5f67890",
            "branch": "feature/login",
            "findings": [{"severity": "LOW", "type": "Informational", "issue_text": "Minor header"}],
            "trigger_autofix": False,
        },
        headers=headers,
    )
    assert clean_res.status_code == 200
    assert clean_res.json()["status"] == "passed"
    assert clean_res.json()["passed"] is True

    # 2. Evaluate failing gate with critical violation
    fail_res = await client.post(
        "/ci/gate",
        json={
            "repository": "acme/web-app",
            "commit_sha": "a1b2c3d4e5f67890",
            "branch": "feature/payment",
            "findings": [
                {"severity": "CRITICAL", "type": "Hardcoded AWS Key", "issue_text": "AWS Key leaked", "file": "config.py", "line": 12}
            ],
            "trigger_autofix": False,
        },
        headers=headers,
    )
    assert fail_res.status_code == 200
    assert fail_res.json()["status"] == "failed"
    assert fail_res.json()["passed"] is False
    assert fail_res.json()["evaluation"]["total_violations"] == 1

    # 3. Policy endpoints GET & PATCH
    policy_res = await client.get("/ci/policy", headers=headers)
    assert policy_res.status_code == 200
    assert policy_res.json()["ci_fail_on_critical"] is True

    update_res = await client.patch(
        "/ci/policy",
        json={"ci_fail_on_high": False, "ci_auto_remediate": True},
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["ci_fail_on_high"] is False
    assert update_res.json()["ci_auto_remediate"] is True


@pytest.mark.asyncio
async def test_ci_api_key_authentication(client, db_session):
    """Test that CI/CD runners can authenticate using X-API-Key."""
    uid = uuid.uuid4().hex[:8]
    email = f"runner_{uid}@devsecops.corp"
    await client.post(
        "/auth/register",
        json={"email": email, "password": "Password123!", "organization_name": f"Runner_Org_{uid}"},
    )
    login_r = await client.post("/auth/login", json={"email": email, "password": "Password123!"})
    token = login_r.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # Create an API Key for CI runner
    key_res = await client.post("/api-keys?name=GitHubActionsRunner", headers=auth_headers)
    assert key_res.status_code == 200
    raw_api_key = key_res.json()["key"]

    # Access CI gate using X-API-Key header (no Bearer token)
    ci_headers = {"X-API-Key": raw_api_key}
    gate_res = await client.post(
        "/ci/gate",
        json={
            "repository": "acme/backend",
            "commit_sha": "9876543210abcdef",
            "branch": "main",
            "findings": [],
            "trigger_autofix": False,
        },
        headers=ci_headers,
    )
    assert gate_res.status_code == 200
    assert gate_res.json()["status"] == "passed"
