"""
Tests for SageAI Wave 6 Phase 6.5: Zero-Trust Workload Identity Fabric (SPIFFE/SPIRE & Cilium eBPF L7).
"""

import pytest
from app.services.workload_identity.spiffe_spire_service import (
    spiffe_spire_service,
)


def test_list_active_svids():
    svids = spiffe_spire_service.list_active_svids()
    assert len(svids) >= 3
    assert any("order-service" in s["spiffe_id"] for s in svids)
    assert any("payment-service" in s["spiffe_id"] for s in svids)


def test_issue_svid():
    res = spiffe_spire_service.issue_svid(
        namespace="prod",
        service_account="risk-evaluator",
        enclave_attested=True,
        operator="TestSPIREServer",
    )
    assert res["status"] == "success"
    svid = res["svid"]
    assert "svid-ris-" in svid["svid_id"]
    assert svid["spiffe_id"] == "spiffe://sageai.internal/ns/prod/sa/risk-evaluator"
    assert svid["ttl_minutes"] == 60
    assert svid["status"] == "ACTIVE_VALID"


def test_evaluate_cilium_l7_policy_allow():
    res = spiffe_spire_service.evaluate_cilium_l7_policy(
        source_spiffe_id="spiffe://sageai.internal/ns/prod/sa/order-service",
        destination_spiffe_id="spiffe://sageai.internal/ns/prod/sa/payment-service",
        http_method="POST",
        http_path="/v1/charge",
    )
    assert res["verdict"] == "ALLOW"
    assert "EBPF_ALLOW_MUTUAL_TLS_L7_AUTHORIZED" in res["kernel_reason"]


def test_evaluate_cilium_l7_policy_drop_unauthorized_method():
    res = spiffe_spire_service.evaluate_cilium_l7_policy(
        source_spiffe_id="spiffe://sageai.internal/ns/prod/sa/order-service",
        destination_spiffe_id="spiffe://sageai.internal/ns/prod/sa/payment-service",
        http_method="DELETE",
        http_path="/v1/charge",
    )
    assert res["verdict"] == "DROP"
    assert "EBPF_DROP_UNAUTHORIZED_L7_METHOD_OR_PATH" in res["kernel_reason"]


def test_revoke_svid():
    # Issue temporary SVID
    issue_res = spiffe_spire_service.issue_svid(
        namespace="dev",
        service_account="temp-leaked-worker",
    )
    svid_id = issue_res["svid"]["svid_id"]

    # Revoke
    revoke_res = spiffe_spire_service.revoke_svid(svid_id, operator="TestSecOpsDirector")
    assert revoke_res["status"] == "success"
    assert revoke_res["verdict"] == "REVOCATION_BROADCAST_COMPLETE"
    assert revoke_res["ebpf_map_updated"] is True

    # Verify SVID state
    svid = spiffe_spire_service.svid_registry[svid_id]
    assert svid["status"] == "REVOKED_COMPROMISED"

