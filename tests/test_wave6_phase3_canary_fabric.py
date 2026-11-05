"""
Tests for SageAI Wave 6 Phase 6.3: Dynamic Synthetic Honeytoken & Active Canary Fabric.
"""

import pytest
from app.services.canary_fabric.canary_fabric_service import (
    canary_fabric_service,
)


def test_list_deployed_canaries():
    canaries = canary_fabric_service.list_deployed_canaries()
    assert len(canaries) >= 4
    types = {c["token_type"] for c in canaries}
    assert "CLOUD_IAM" in types
    assert "GIT_REPO_SECRET" in types
    assert "DATABASE_TABLE" in types
    assert "ACTIVE_DIRECTORY_SPN" in types


def test_deploy_dynamic_honeytoken_iam():
    res = canary_fabric_service.deploy_honeytoken(
        token_type="CLOUD_IAM",
        deployment_target="s3://vault-prod-backups/.env",
        memo="Decoy AWS STS key for S3 exfiltration trap",
        operator="TestSecOpsLead",
    )
    assert res["status"] == "success"
    canary = res["canary"]
    assert "canary-cloud_iam-" in canary["canary_id"]
    assert "ASIA" in canary["token_preview"]
    assert canary["status"] == "ACTIVE_MONITORED"


def test_deploy_dynamic_honeytoken_git():
    res = canary_fabric_service.deploy_honeytoken(
        token_type="GIT_REPO_SECRET",
        deployment_target="repo: frontend-web/.env.local",
    )
    assert res["status"] == "success"
    canary = res["canary"]
    assert "ghp_decoy_" in canary["token_preview"]


def test_trigger_tripwire_with_sdn_containment():
    canary_id = "canary-iam-aws-01"
    attacker_ip = "203.0.113.88"

    res = canary_fabric_service.trigger_tripwire(
        canary_id=canary_id,
        attacker_ip=attacker_ip,
        user_agent="boto3/1.28.5 (ExfiltrationTool)",
        target_service="AWS STS GetCallerIdentity",
        auto_isolate_host=True,
    )
    assert res["status"] == "TRIPWIRE_ALERT_ACTIVE"
    event = res["event"]
    assert event["canary_id"] == canary_id
    assert event["alert_severity"] == "CRITICAL_ZERO_TOLERANCE_BREACH"
    assert event["sdn_containment"] is not None
    assert event["sdn_containment"]["status"] == "ISOLATED_QUARANTINED"
    assert event["sdn_containment"]["redirect_to_honeynet"] is True

    # Check canary state updated
    canary = canary_fabric_service.canaries[canary_id]
    assert canary["tripwire_count"] >= 1
    assert canary["status"] == "TRIPWIRE_TRIGGERED_ACTIVE_ALERT"


def test_get_tripwire_history():
    history = canary_fabric_service.get_tripwire_history()
    assert len(history) >= 1
    assert any(h["attacker_ip"] == "203.0.113.88" for h in history)

