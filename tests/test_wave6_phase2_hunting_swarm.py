"""
Tests for SageAI Wave 6 Phase 6.2: Autonomous Multi-Agent Threat Hunting Swarm.
"""

from app.services.threat_hunting_swarm.hunting_swarm_service import (
    threat_hunting_swarm_service,
)


def test_list_active_hunts():
    hunts = threat_hunting_swarm_service.list_active_hunts()
    assert len(hunts) >= 3
    assert any("Process Injection" in h["topic"] for h in hunts)


def test_launch_hunt_default():
    res = threat_hunting_swarm_service.launch_hunt(
        hunt_topic="Process Injection & Memory Hollowing",
        operator="TestHunter",
    )
    assert res["status"] == "success"
    hunt = res["hunt"]
    assert "hunt-swm-" in hunt["hunt_id"]
    assert hunt["technique"] == "T1055 (Process Injection)"
    assert "hypothesis_agent" in hunt["agents"]
    assert "telemetry_agent" in hunt["agents"]
    assert "correlation_agent" in hunt["agents"]
    assert "arbiter_agent" in hunt["agents"]
    assert hunt["agents"]["correlation_agent"]["confidence_score"] > 90.0


def test_launch_hunt_active_directory_dcsync():
    res = threat_hunting_swarm_service.launch_hunt(
        hunt_topic="Active Directory DCSync Replication Probe",
        operator="TestHunter",
    )
    assert res["status"] == "success"
    hunt = res["hunt"]
    assert "T1003.006" in hunt["technique"]
    assert (
        hunt["agents"]["telemetry_agent"]["findings"][0]["target_process"]
        == "lsass.exe"
    )


def test_execute_hunt_containment():
    # First launch hunt
    res = threat_hunting_swarm_service.launch_hunt(hunt_topic="Process Injection")
    hunt_id = res["hunt"]["hunt_id"]

    # Execute containment
    action_res = threat_hunting_swarm_service.execute_hunt_containment(
        hunt_id=hunt_id,
        action="TERMINATE_HOLLOWED_PROCESS_AND_CONTAIN_HOST",
        operator="TestSecOpsDirector",
    )
    assert action_res["status"] == "success"
    assert action_res["action_result"] == "CONTAINMENT_SUCCESSFULLY_APPLIED"

    # Verify updated status
    updated_hunt = threat_hunting_swarm_service.active_hunts[hunt_id]
    assert updated_hunt["status"] == "CONTAINMENT_ENFORCED"
    assert (
        updated_hunt["enforced_action"] == "TERMINATE_HOLLOWED_PROCESS_AND_CONTAIN_HOST"
    )
