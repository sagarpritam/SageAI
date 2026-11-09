"""
Unit and integration tests for SageAI Enterprise Security Capabilities:
- Reverse Engineering & Disassembly
- Honeypots & Deception Technology
- Advanced Attack Detection (WAF/IDS)
- Network Intrusion Detection & C2 Beaconing (NIDS)
- Automated Incident Response & SOAR Safety Gates
"""

import base64
import time

from app.services.deception.honeypot_service import DeceptionHoneypotService
from app.services.detection.attack_detector import AttackDetector
from app.services.detection.nids_monitor import NIDSMonitor
from app.services.incident_response.soar_engine import IncidentResponseEngine
from app.services.malware.reverse_engineer import ReverseEngineeringEngine

# ─────────────────────────────────────────────────────────────────────────────
# 1. Reverse Engineering Engine Tests
# ─────────────────────────────────────────────────────────────────────────────


def test_reverse_engineering_pe_sections_and_iat():
    re_engine = ReverseEngineeringEngine()

    # Synthetic binary with PE signature, mock IAT strings, and Base64 encoded payload
    encoded_payload = base64.b64encode(b"powershell.exe -enc aGVsbG8=").decode("ascii")
    sample_data = (
        b"MZ"
        + b"\x00" * 0x3A
        + b"\x80\x00\x00\x00"
        + b"\x00" * 0x40
        + b"PE\x00\x00\x4c\x01\x02\x00"  # 2 sections
        + b"\x00" * 16
        + b"\xe0\x00"
        + b"\x00" * 224
        +
        # Section 1: .text
        b".text\x00\x00\x00\x00\x10\x00\x00\x00\x10\x00\x00\x00\x10\x00\x00\x00\x04\x00\x00\x00"
        + b"\x00" * 16
        +
        # Strings in binary
        b"VirtualAllocEx WriteProcessMemory CreateRemoteThread IsDebuggerPresent "
        + encoded_payload.encode("ascii")
    )

    analysis = re_engine.analyze_binary(sample_data, filename="trojan_dropper.exe")

    assert analysis["filename"] == "trojan_dropper.exe"
    assert "Process Injection" in analysis["imported_apis"]
    assert "VirtualAllocEx" in analysis["imported_apis"]["Process Injection"]
    assert "Anti-Debugging & Evasion" in analysis["imported_apis"]
    assert any("Process Injection" in cap for cap in analysis["detected_capabilities"])
    assert len(analysis["disassembly_preview"]) > 0


def test_reverse_engineering_disassembly_instructions():
    re_engine = ReverseEngineeringEngine()
    # x86 instructions: push ebp (0x55), mov ebp, esp (0x89 0xE5), ret (0xC3)
    raw_instructions = bytes([0x55, 0x89, 0xC3, 0x90, 0xCC])
    disasm = re_engine.disassemble_stream(raw_instructions)

    assert len(disasm) == 5
    assert "push" in disasm[0]["disassembly"]
    assert "ret" in disasm[2]["disassembly"]
    assert "nop" in disasm[3]["disassembly"]


# ─────────────────────────────────────────────────────────────────────────────
# 2. Honeypots & Deception Technology Tests
# ─────────────────────────────────────────────────────────────────────────────


def test_deception_honeypot_decoys_and_canary():
    deception = DeceptionHoneypotService()

    decoys = deception.get_decoy_endpoints()
    assert len(decoys) >= 4
    assert any(d["path"] == "/wp-login.php" for d in decoys)

    # Generate canary tokens
    token_api = deception.generate_canary_token(
        token_type="api_key", label="Mock DB Key"
    )
    token_aws = deception.generate_canary_token(
        token_type="aws_key", label="S3 Backup Key"
    )

    assert token_api["canary_value"].startswith("sage_honey_live_")
    assert token_aws["canary_value"].startswith("AKIA")

    # Record decoy hit
    event = deception.record_decoy_hit(
        path="/.env",
        source_ip="198.51.100.22",
        user_agent="sqlmap/1.7",
        payload="test_exploit",
    )
    assert event["severity"] == "CRITICAL"
    assert "100%" in event["confidence"]
    assert event["fingerprint"] is not None

    # Verify canary access
    canary_alert = deception.verify_canary_access(
        token_api["canary_value"], source_ip="203.0.113.88"
    )
    assert canary_alert is not None
    assert canary_alert["severity"] == "CRITICAL"
    assert "Canary token" in canary_alert["alert"]


# ─────────────────────────────────────────────────────────────────────────────
# 3. Advanced Attack Detection (WAF/IDS) Tests
# ─────────────────────────────────────────────────────────────────────────────


def test_attack_detector_sqli_xss_cmdi_ssrf():
    detector = AttackDetector()

    # 1. SQL Injection
    sqli_hits = detector.analyze_payload(
        target_path="/api/users",
        query_params="id=1' UNION SELECT username, password FROM users--",
        source_ip="192.0.2.1",
    )
    assert len(sqli_hits) > 0
    assert sqli_hits[0]["attack_type"] == "SQL_INJECTION"
    assert sqli_hits[0]["severity"] == "CRITICAL"

    # 2. XSS
    xss_hits = detector.analyze_payload(
        target_path="/search",
        query_params="q=<script>alert('XSS')</script>",
        source_ip="192.0.2.2",
    )
    assert any(h["attack_type"] == "CROSS_SITE_SCRIPTING" for h in xss_hits)

    # 3. Command Injection
    cmdi_hits = detector.analyze_payload(
        target_path="/api/ping",
        body="host=127.0.0.1; whoami",
        source_ip="192.0.2.3",
    )
    assert any(h["attack_type"] == "COMMAND_INJECTION" for h in cmdi_hits)

    # 4. SSRF Cloud Metadata
    ssrf_hits = detector.analyze_payload(
        target_path="/fetch",
        query_params="url=http://169.254.169.254/latest/meta-data/iam/security-credentials/",
        source_ip="192.0.2.4",
    )
    assert any(h["attack_type"] == "SSRF_CLOUD_METADATA" for h in ssrf_hits)

    # 5. Path Traversal
    traversal_hits = detector.analyze_payload(
        target_path="/download",
        query_params="file=../../../../etc/passwd",
        source_ip="192.0.2.5",
    )
    assert any(h["attack_type"] == "PATH_TRAVERSAL" for h in traversal_hits)


def test_attack_detector_brute_force_sliding_window():
    detector = AttackDetector(brute_force_threshold=3, window_seconds=10)
    ip = "198.51.100.99"

    # Attempts 1 and 2: no alert yet
    assert detector.record_auth_attempt(ip, success=False) is None
    assert detector.record_auth_attempt(ip, success=False) is None

    # Attempt 3: threshold reached -> alert triggered
    alert = detector.record_auth_attempt(ip, success=False)
    assert alert is not None
    assert alert["attack_type"] == "BRUTE_FORCE_CREDENTIAL_ATTACK"
    assert alert["attempt_count"] == 3


# ─────────────────────────────────────────────────────────────────────────────
# 4. Network Intrusion Detection (NIDS) Tests
# ─────────────────────────────────────────────────────────────────────────────


def test_nids_port_scan_detection():
    nids = NIDSMonitor(port_scan_threshold=4, scan_window_seconds=10)
    attacker_ip = "203.0.113.50"

    # Probe 3 ports: no alert
    assert nids.record_connection_probe(attacker_ip, 22) is None
    assert nids.record_connection_probe(attacker_ip, 80) is None
    assert nids.record_connection_probe(attacker_ip, 443) is None

    # Probe 4th port: threshold reached
    alert = nids.record_connection_probe(attacker_ip, 8080)
    assert alert is not None
    assert alert["alert_type"] == "NIDS_PORT_SCAN_DETECTED"
    assert alert["port_count"] >= 4
    assert 22 in alert["distinct_ports_scanned"]


def test_nids_c2_beaconing_detection():
    nids = NIDSMonitor()
    internal_host = "10.0.1.15"
    c2_ip = "198.51.100.77"

    # Simulate periodic beaconing at exact 5-second intervals with tiny jitter
    base_t = time.time()
    intervals = [5.0, 5.05, 4.98, 5.02, 5.01, 4.99]
    t = base_t
    detected = None

    for interval in intervals:
        t += interval
        alert = nids.record_outbound_connection(internal_host, c2_ip, timestamp=t)
        if alert:
            detected = alert

    assert detected is not None
    assert detected["alert_type"] == "NIDS_C2_BEACONING_SUSPECTED"
    assert detected["severity"] == "CRITICAL"
    assert detected["observed_interval_seconds"] == 5.01


# ─────────────────────────────────────────────────────────────────────────────
# 5. SOAR Automated Incident Response & Safety Gates Tests
# ─────────────────────────────────────────────────────────────────────────────


def test_soar_incident_lifecycle_and_safety_authorization():
    soar = IncidentResponseEngine()

    incident = soar.create_incident(
        title="Unauthorized Cloud Metadata Exfiltration",
        severity="CRITICAL",
        source="WAF Attack Detector",
        details={"path": "/proxy", "target": "169.254.169.254"},
        org_id="org_test",
    )

    assert incident["incident_id"].startswith("INC-")
    assert incident["status"] == "OPEN"

    # Safe actions should have auto-executed immediately
    executed_names = [a["action"] for a in incident["executed_actions"]]
    assert "GENERATE_VIRTUAL_PATCH" in executed_names
    assert "NOTIFY_SOC_WEBHOOK" in executed_names

    # Test High-Impact Action: BLOCK_IP_FIREWALL
    # 1. Rejection without authorization / low role (viewer)
    blocked_res = soar.execute_high_impact_action(
        incident_id=incident["incident_id"],
        action_name="BLOCK_IP_FIREWALL",
        approved_by="analyst@example.com",
        role="viewer",
    )
    assert blocked_res["status"] == "BLOCKED_BY_SAFETY_POLICY"

    # 2. Execution when approved by CISO / Admin
    approved_res = soar.execute_high_impact_action(
        incident_id=incident["incident_id"],
        action_name="BLOCK_IP_FIREWALL",
        approved_by="ciso@enterprise.com",
        role="ciso",
    )
    assert approved_res["status"] == "SUCCESS"
    assert incident["status"] == "CONTAINED"
    assert any(a["action"] == "BLOCK_IP_FIREWALL" for a in incident["executed_actions"])
