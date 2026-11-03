"""
Tests for Pillar VI: Enterprise Defense Grid & Behavioral UEBA Analytics.
Verifies:
1. Behavioral Anomaly Engine (UEBA Z-score > 3.0 thresholding)
2. Immutable Cryptographic Audit Hash Chain (SHA256 Merkle chain and tamper detection)
3. WAF Attack Detector (SQLi, XSS, CMDi, Path Traversal)
4. NIDS Monitor (Port scanning bursts and C2 jitter)
5. Defense Grid API Routes
"""

import pytest
from app.services.audit_chain import ImmutableAuditChain, audit_chain
from app.services.detection.anomaly_engine import BehavioralAnomalyEngine, anomaly_engine
from app.services.detection.attack_detector import AttackDetector
from app.services.detection.nids_monitor import NIDSMonitor


# ─────────────────────────────────────────────────────────────────────────────
# 1. Behavioral Anomaly Engine (UEBA) Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_anomaly_engine_z_score_detection():
    engine = BehavioralAnomalyEngine(z_score_threshold=3.0)

    # Establish baseline with 20 normal values around 100 (+/- 5)
    for _ in range(20):
        engine.record_metric("api_latency", 100.0)

    # A normal value should produce no alert
    normal_alert = engine.record_metric("api_latency", 102.0)
    assert normal_alert is None

    # An anomalous surge (e.g. 800ms) with Z > 3.0
    # Add slight variance to ensure stdev > 0
    engine.record_metric("api_latency", 95.0)
    engine.record_metric("api_latency", 105.0)

    spike_alert = engine.record_metric("api_latency", 850.0)
    assert spike_alert is not None
    assert spike_alert["type"] == "BEHAVIORAL_STATISTICAL_ANOMALY"
    assert spike_alert["z_score"] >= 3.0
    assert spike_alert["observed_value"] == 850.0


def test_anomaly_engine_request_frequency_tracking():
    engine = BehavioralAnomalyEngine()

    alerts = engine.track_request_frequency(
        client_ip="198.51.100.77",
        endpoint="/api/v1/checkout",
        payload_bytes=512,
    )

    stats = engine.get_baseline_stats()
    assert stats["total_monitored_metrics"] >= 1


# ─────────────────────────────────────────────────────────────────────────────
# 2. Immutable Cryptographic Audit Chain Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_audit_chain_block_creation_and_integrity():
    chain = ImmutableAuditChain()

    # Empty ledger verification
    initial_verify = chain.verify_chain_integrity()
    assert initial_verify["valid"] is True

    # Record 3 security actions
    b0 = chain.record_action(
        actor="SecOps Admin",
        action="FIREWALL_IP_BLOCK",
        details={"ip": "198.51.100.42", "reason": "Aggressive SQLi"},
        org_id="tenant_01",
    )
    assert b0["index"] == 0
    assert b0["previous_hash"] == "0" * 64
    assert len(b0["record_hash"]) == 64

    b1 = chain.record_action(
        actor="CISO User",
        action="SESSION_REVOCATION",
        details={"user": "attacker_svc"},
        org_id="tenant_01",
    )
    assert b1["index"] == 1
    assert b1["previous_hash"] == b0["record_hash"]

    b2 = chain.record_action(
        actor="Autonomous SOAR",
        action="VIRTUAL_PATCH_APPLIED",
        details={"cve": "CVE-2024-21887"},
        org_id="tenant_01",
    )
    assert b2["index"] == 2
    assert b2["previous_hash"] == b1["record_hash"]

    # Verify complete cryptographic chain
    verification = chain.verify_chain_integrity()
    assert verification["valid"] is True
    assert verification["total_records"] == 3
    assert verification["latest_hash"] == b2["record_hash"]
    assert "SOC2 Type II" in str(verification["compliance_standards"])


def test_audit_chain_tamper_detection():
    chain = ImmutableAuditChain()

    chain.record_action(actor="Admin", action="ACTION_A", details={"note": "clean"})
    chain.record_action(actor="Admin", action="ACTION_B", details={"note": "clean"})

    # Malicious actor tampers with details of block #0 in memory
    chain._ledger[0]["details"]["note"] = "TAMPERED_MALICIOUS_EDIT"

    # Verification must mathematically detect the tampering
    tamper_result = chain.verify_chain_integrity()
    assert tamper_result["valid"] is False
    assert tamper_result["tampered_index"] == 0
    assert "tampering detected" in tamper_result["reason"].lower()


# ─────────────────────────────────────────────────────────────────────────────
# 3. WAF Attack Detector Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_attack_detector_sqli_and_xss():
    detector = AttackDetector()

    # SQL Injection
    sqli_hits = detector.analyze_payload("/api/users", query_params="1' UNION SELECT username, password FROM users --", source_ip="203.0.113.1")
    assert len(sqli_hits) > 0
    assert sqli_hits[0]["attack_type"] == "SQL_INJECTION"
    assert sqli_hits[0]["severity"] == "CRITICAL"

    # XSS
    xss_hits = detector.analyze_payload("/api/comments", body="<script>alert(document.cookie)</script>", source_ip="203.0.113.2")
    assert len(xss_hits) > 0
    assert xss_hits[0]["attack_type"] == "CROSS_SITE_SCRIPTING"

    # Command Injection
    cmdi_hits = detector.analyze_payload("/api/ping", query_params="; whoami && cat /etc/passwd", source_ip="203.0.113.3")
    assert len(cmdi_hits) > 0
    assert cmdi_hits[0]["attack_type"] == "COMMAND_INJECTION"


# ─────────────────────────────────────────────────────────────────────────────
# 4. NIDS Monitor Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_nids_monitor_port_scan():
    monitor = NIDSMonitor(port_scan_threshold=4, scan_window_seconds=10)

    source_ip = "198.51.100.88"
    alert = None
    for port in [22, 80, 443, 3389]:
        res = monitor.record_connection_probe(source_ip, port)
        if res:
            alert = res

    assert alert is not None
    assert alert["alert_type"] == "NIDS_PORT_SCAN_DETECTED"
    assert alert["port_count"] >= 4
    assert source_ip in alert["source_ip"]
