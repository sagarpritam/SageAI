"""
Tests for Incident Response to SagePatch Code Remediation Bridge.

Verifies that incidents flagged by WAF, NIDS, or Deception engines can automatically
generate AST-validated code patches that enter the SagePatch review queue for human sign-off.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.incident_response.soar_engine import soar_engine


@pytest.mark.asyncio
async def test_incident_to_sagepatch_remediation_pipeline():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        from app.core.security import create_access_token

        token = create_access_token(
            {"sub": "secops@sageai.io", "role": "admin", "org": "remediation-test-org"}
        )
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create a simulated SQLi incident via SOAR engine
        incident = soar_engine.create_incident(
            title="SQL Injection Exploit on /api/v1/auth/login",
            severity="CRITICAL",
            source="Ingress WAF Sentinel",
            details={
                "target_path": "/api/v1/auth/login",
                "matched_pattern": "union select",
                "attacker_ip": "203.0.113.88",
            },
            org_id="remediation-test-org",
        )
        assert incident["incident_id"] is not None

        # 2. Call the remediation endpoint
        res = await client.post(
            f"/incidents/{incident['incident_id']}/remediate",
            json={
                "repository": "demo/security-app",
                "file_path": "app/db/repositories.py",
            },
            headers=headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert "patch_id" in data
        assert "diff" in data
        assert "vulnerability_type" in data
        assert data["vulnerability_type"] == "SQL Injection"
        assert "--- a/app/db/repositories.py" in data["diff"]
        assert "+++ b/app/db/repositories.py" in data["diff"]

        # 3. Verify the patch appears in the AutoFix Review Queue
        patches_res = await client.get("/autofix/patches", headers=headers)
        assert patches_res.status_code == 200
        patch_list = patches_res.json()
        matching = [p for p in patch_list if p["id"] == data["patch_id"]]
        assert len(matching) == 1
        assert matching[0]["sandbox_passed"] is True
        assert matching[0]["status"] == "proposed"
