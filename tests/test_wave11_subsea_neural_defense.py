"""
Test Suite for Wave 11: Deep-Sea Subsea Fiber Interception, Neural BCI Zero-Trust Gate & Sovereign Inter-Grid Failover (v4.4 Milestone):
1. Capability 53: Deep-Sea Subsea Fiber-Optic Cable Acoustic & Optical Tap Sensor Interceptor (subsea_cable_guard)
2. Capability 54: Autonomous Biometric & Neural Interface (BCI) Zero-Trust Cryptographic Gate (neural_bci_guard)
3. Capability 55: Sovereign Nation-State Critical Infrastructure Inter-Grid Autonomous Failover (intergrid_failover_guard)
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.subsea_telecom.subsea_cable_guard import subsea_cable_guard
from app.services.neural_bci.neural_bci_guard import neural_bci_guard
from app.services.intergrid_failover.intergrid_failover_guard import intergrid_failover_guard


@pytest.fixture
def client():
    return TestClient(app)


# ----------------------------------------------------
# 1. Capability 53: Subsea Cable Guard Tests
# ----------------------------------------------------
def test_subsea_cable_guard_service():
    cables = subsea_cable_guard.list_cables()
    assert len(cables) >= 3
    cable_ids = [c["cable_id"] for c in cables]
    assert "cable-transatlantic-ta01" in cable_ids

    # Query individual cable
    ta01 = subsea_cable_guard.get_cable("cable-transatlantic-ta01")
    assert ta01 is not None
    assert ta01["length_km"] > 5000.0
    assert ta01["capacity_tbps"] >= 300.0

    # Nominal optical telemetry
    nominal_eval = subsea_cable_guard.inspect_optical_telemetry(
        cable_id="cable-transatlantic-ta01",
        otdr_db_loss=0.165,
        sop_rotation_rad_s=4.2,
        das_acoustic_db=-55.0,
    )
    assert nominal_eval["threat_detected"] is False
    assert nominal_eval["threat_type"] == "NOMINAL_PHYSICAL_OCEAN_BED"

    # Microbending optical tap detection (> 0.25 dB)
    tap_eval = subsea_cable_guard.inspect_optical_telemetry(
        cable_id="cable-transatlantic-ta01",
        otdr_db_loss=0.320,
        sop_rotation_rad_s=12.0,
        das_acoustic_db=-50.0,
    )
    assert tap_eval["threat_detected"] is True
    assert tap_eval["threat_type"] == "OPTICAL_MICROBENDING_TAP_DETECTED"
    assert "LOOPBACK_SEVERANCE" in tap_eval["recommended_action"]

    # Autonomous loopback severance
    severance = subsea_cable_guard.trigger_autonomous_severance(
        cable_id="cable-transatlantic-ta01",
        reason="Physical microbending fiber tap detected",
    )
    assert severance["new_status"] == "SEVERED_LOOPBACK_ISOLATED"
    assert severance["severance_latency_ms"] < 15.0
    assert "polar03" in severance["rerouted_to"]

    # Metrics
    metrics = subsea_cable_guard.get_subsea_metrics()
    assert metrics["monitored_subsea_cables"] >= 3
    assert metrics["total_route_length_km"] > 20000.0


# ----------------------------------------------------
# 2. Capability 54: Neural BCI Guard Tests
# ----------------------------------------------------
def test_neural_bci_guard_service():
    operators = neural_bci_guard.list_operators()
    assert len(operators) >= 3
    op_ids = [o["operator_id"] for o in operators]
    assert "bci-ciso-commander-01" in op_ids

    # Query single operator
    ciso = neural_bci_guard.get_operator("bci-ciso-commander-01")
    assert ciso is not None
    assert ciso["eeg_channel_count"] == 64

    # Nominal neural intent evaluation
    nominal = neural_bci_guard.evaluate_neural_intent(
        operator_id="bci-ciso-commander-01",
        p300_amplitude_uv=14.5,
        n400_latency_ms=395.0,
        cognitive_stress_index=0.25,
        synthetic_replay_flag=False,
    )
    assert nominal["access_granted"] is True
    assert nominal["threat_detected"] is False
    assert nominal["raw_eeg_persisted"] is False

    # Cognitive duress / coercion detection (stress > 0.85)
    duress = neural_bci_guard.evaluate_neural_intent(
        operator_id="bci-ciso-commander-01",
        p300_amplitude_uv=14.5,
        n400_latency_ms=395.0,
        cognitive_stress_index=0.92,
        synthetic_replay_flag=False,
    )
    assert duress["access_granted"] is False
    assert duress["threat_detected"] is True
    assert duress["threat_type"] == "COGNITIVE_DURESS_COERCION_DETECTED"

    # Synthetic brainwave replay attack
    replay = neural_bci_guard.evaluate_neural_intent(
        operator_id="bci-ciso-commander-01",
        p300_amplitude_uv=14.5,
        n400_latency_ms=395.0,
        cognitive_stress_index=0.20,
        synthetic_replay_flag=True,
    )
    assert replay["access_granted"] is False
    assert replay["threat_type"] == "SYNTHETIC_BRAINWAVE_REPLAY_ATTACK"

    # Issue PQC SVID token
    svid = neural_bci_guard.issue_pqc_neural_svid("bci-ciso-commander-01")
    assert svid["algorithm"] == "ML-DSA-65_POST_QUANTUM"
    assert "spiffe://" in svid["spiffe_id"]
    assert svid["validity_seconds"] == 300

    # Metrics
    metrics = neural_bci_guard.get_bci_metrics()
    assert metrics["enrolled_bci_operators"] >= 3
    assert metrics["raw_brainwave_privacy_retention_pct"] == 100.0


# ----------------------------------------------------
# 3. Capability 55: InterGrid Failover Guard Tests
# ----------------------------------------------------
def test_intergrid_failover_guard_service():
    grids = intergrid_failover_guard.list_interconnects()
    assert len(grids) >= 3
    grid_ids = [g["grid_id"] for g in grids]
    assert "grid-eastern-interconnect" in grid_ids

    # Query single grid
    espi = intergrid_failover_guard.get_interconnect("grid-eastern-interconnect")
    assert espi is not None
    assert espi["nominal_frequency_hz"] == 60.0

    # Nominal stability evaluation
    nominal = intergrid_failover_guard.evaluate_grid_stability(
        grid_id="grid-eastern-interconnect",
        frequency_hz=60.01,
        phase_angle_delta_deg=5.2,
        rocof_hz_s=0.05,
    )
    assert nominal["threat_detected"] is False
    assert nominal["threat_type"] == "NOMINAL_GRID_STABILITY"

    # Frequency collapse attack (< 59.2 Hz)
    collapse = intergrid_failover_guard.evaluate_grid_stability(
        grid_id="grid-eastern-interconnect",
        frequency_hz=58.95,
        phase_angle_delta_deg=35.0,
        rocof_hz_s=1.85,
    )
    assert collapse["threat_detected"] is True
    assert collapse["threat_type"] == "CRITICAL_FREQUENCY_COLLAPSE_ATTACK"
    assert "ISLANDING" in collapse["action_recommended"]

    # Trigger autonomous islanding
    islanding = intergrid_failover_guard.trigger_autonomous_islanding(
        grid_id="grid-eastern-interconnect",
        reason="Imminent regional frequency collapse attack",
    )
    assert islanding["new_status"] == "ISLANDED_AUTONOMOUS_OPERATION"
    assert islanding["tripping_speed_ms"] < 18.0

    # Metrics
    metrics = intergrid_failover_guard.get_intergrid_metrics()
    assert metrics["monitored_interconnections"] >= 3
    assert metrics["total_generation_monitored_gw"] > 800.0


# ----------------------------------------------------
# 4. Wave 11 FastAPI Routers TestClient Tests
# ----------------------------------------------------
def test_wave11_fastapi_routers(client):
    from app.core.security import get_current_user
    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "NationalSecurityCommanderAdmin",
        "org": "enterprise",
        "email": "commander@sageai.internal",
    }

    try:
        # Subsea Cable routes
        res = client.get("/subsea-cable/cables")
        assert res.status_code == 200
        assert len(res.json()["cables"]) >= 3

        res_insp = client.post("/subsea-cable/inspect-telemetry", json={
            "cable_id": "cable-transpacific-tp02",
            "otdr_db_loss": 0.35,
            "sop_rotation_rad_s": 55.0,
            "das_acoustic_db": -25.0,
        })
        assert res_insp.status_code == 200
        assert res_insp.json()["inspection"]["threat_detected"] is True

        res_sev = client.post("/subsea-cable/trigger-severance", json={
            "cable_id": "cable-transpacific-tp02",
            "reason": "Hostile submersible fiber microbending detected",
        })
        assert res_sev.status_code == 200
        assert res_sev.json()["severance"]["new_status"] == "SEVERED_LOOPBACK_ISOLATED"

        res_sub_met = client.get("/subsea-cable/metrics")
        assert res_sub_met.status_code == 200

        # Neural BCI routes
        res = client.get("/neural-bci/operators")
        assert res.status_code == 200
        assert len(res.json()["operators"]) >= 3

        res_bci_eval = client.post("/neural-bci/evaluate-intent", json={
            "operator_id": "bci-scada-engineer-02",
            "p300_amplitude_uv": 12.0,
            "n400_latency_ms": 410.0,
            "cognitive_stress_index": 0.95,
            "synthetic_replay_flag": False,
        })
        assert res_bci_eval.status_code == 200
        assert res_bci_eval.json()["evaluation"]["threat_detected"] is True
        assert res_bci_eval.json()["evaluation"]["access_granted"] is False

        res_svid = client.post("/neural-bci/issue-svid", json={
            "operator_id": "bci-scada-engineer-02",
        })
        assert res_svid.status_code == 200
        assert res_svid.json()["svid"]["algorithm"] == "ML-DSA-65_POST_QUANTUM"

        res_bci_met = client.get("/neural-bci/metrics")
        assert res_bci_met.status_code == 200

        # InterGrid Failover routes
        res = client.get("/intergrid-failover/interconnects")
        assert res.status_code == 200
        assert len(res.json()["interconnects"]) >= 3

        res_grid_eval = client.post("/intergrid-failover/evaluate-stability", json={
            "grid_id": "grid-western-interconnect",
            "frequency_hz": 58.8,
            "phase_angle_delta_deg": 48.0,
            "rocof_hz_s": 2.1,
        })
        assert res_grid_eval.status_code == 200
        assert res_grid_eval.json()["stability_analysis"]["threat_detected"] is True

        res_island = client.post("/intergrid-failover/trigger-islanding", json={
            "grid_id": "grid-western-interconnect",
            "reason": "Cascading phase desync emergency",
        })
        assert res_island.status_code == 200
        assert res_island.json()["islanding"]["new_status"] == "ISLANDED_AUTONOMOUS_OPERATION"

        res_grid_met = client.get("/intergrid-failover/metrics")
        assert res_grid_met.status_code == 200
    finally:
        app.dependency_overrides.clear()

