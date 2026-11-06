"""
Test Suite for Wave 13: Neuromorphic Spiking Chip Defense, Deep-Space Laser Comms & Hypersonic Defense (v4.6.0 Milestone):
1. Capability 59: Neuromorphic Spiking Neural Network (SNN) Sub-Microsecond Edge Threat Classifier (neuromorphic_snn_guard)
2. Capability 60: Deep-Space Interplanetary Optical Laser Telemetry Cryptographic Mesh (deep_space_laser_mesh)
3. Capability 61: Autonomous Multi-Sensor Hypersonic Glide Vehicle (HGV) Trajectory Tracker & Interceptor (hypersonic_interceptor)
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import get_current_user
from app.services.neuromorphic_snn.neuromorphic_snn_guard import neuromorphic_snn_guard
from app.services.deep_space_laser.deep_space_laser_mesh import deep_space_laser_mesh
from app.services.hypersonic_defense.hypersonic_interceptor import hypersonic_interceptor


@pytest.fixture
def client():
    return TestClient(app)


# ----------------------------------------------------
# 1. Capability 59: Neuromorphic SNN Guard Tests
# ----------------------------------------------------
def test_neuromorphic_snn_service():
    cores = neuromorphic_snn_guard.list_cores()
    assert len(cores) >= 3
    core_ids = [c["core_id"] for c in cores]
    assert "core-loihi2-edge-01" in core_ids
    assert "core-dynap-scada-02" in core_ids

    # Query individual core
    loihi = neuromorphic_snn_guard.get_core("core-loihi2-edge-01")
    assert loihi is not None
    assert loihi["total_neurons"] >= 1000000
    assert loihi["status"] == "SPIKING_NOMINAL"

    # Nominal AER spike stream
    nominal = neuromorphic_snn_guard.classify_spike_train(
        core_id="core-loihi2-edge-01",
        mean_spike_rate_mhz=120.0,
        aer_inter_arrival_jitter_ns=12.0,
        voltage_anomaly_mv=15.0,
    )
    assert nominal["threat_detected"] is False
    assert nominal["threat_type"] == "NOMINAL_AER_SPIKE_STREAM"
    assert nominal["inference_latency_ns"] < 450.0

    # Nanosecond voltage fault glitch detection (> 120 mV)
    glitch = neuromorphic_snn_guard.classify_spike_train(
        core_id="core-loihi2-edge-01",
        mean_spike_rate_mhz=130.0,
        aer_inter_arrival_jitter_ns=20.0,
        voltage_anomaly_mv=185.0,
    )
    assert glitch["threat_detected"] is True
    assert glitch["threat_type"] == "NANOSECOND_VOLTAGE_FAULT_GLITCH_INJECTION"
    assert glitch["action_recommended"] == "DISCHARGE_INHIBITORY_NEURO_CLAMP"

    # Malicious DMA bus tampering detection
    bus_tamper = neuromorphic_snn_guard.classify_spike_train(
        core_id="core-dynap-scada-02",
        mean_spike_rate_mhz=155.0,
        aer_inter_arrival_jitter_ns=25.0,
        voltage_anomaly_mv=40.0,
        bus_payload_entropy=7.8,
    )
    assert bus_tamper["threat_detected"] is True
    assert bus_tamper["threat_type"] == "MALICIOUS_DMA_BUS_TAMPERING_INJECTION"

    # Discharge inhibitory GABA-ergic neuro-clamp
    clamp = neuromorphic_snn_guard.inject_inhibitory_clamp(
        core_id="core-loihi2-edge-01",
        clamp_line="BUS_LINE_RESET_ISOLATE",
        response_latency_ns=385.0,
    )
    assert clamp["hardware_bus_isolated"] is True
    assert clamp["response_latency_ns"] < 450.0
    assert clamp["clamp_energy_pj"] < 15.0

    updated_core = neuromorphic_snn_guard.get_core("core-loihi2-edge-01")
    assert updated_core["status"] == "HARDWARE_CLAMPED_SECURE"
    assert updated_core["clamps_active"] >= 1

    # Metrics
    metrics = neuromorphic_snn_guard.get_neuromorphic_metrics()
    assert metrics["monitored_neuromorphic_cores"] >= 3
    assert metrics["inhibitory_clamps_discharged"] >= 1


# ----------------------------------------------------
# 2. Capability 60: Deep-Space Optical Laser Mesh Tests
# ----------------------------------------------------
def test_deep_space_laser_service():
    terminals = deep_space_laser_mesh.list_terminals()
    assert len(terminals) >= 3
    terminal_ids = [t["terminal_id"] for t in terminals]
    assert "dsoc-terminal-earth-palomar" in terminal_ids
    assert "dsoc-terminal-mars-recon-01" in terminal_ids

    # Query terminal
    mars_term = deep_space_laser_mesh.get_terminal("dsoc-terminal-mars-recon-01")
    assert mars_term is not None
    assert mars_term["distance_km"] > 200000000.0

    # Nominal astronomical alignment
    nom_acq = deep_space_laser_mesh.acquire_deepspace_beam(
        terminal_id="dsoc-terminal-earth-palomar",
        point_ahead_angle_urad=1.15,
        doppler_shift_ghz=4.2,
        photon_snr_db=12.5,
    )
    assert nom_acq["threat_detected"] is False
    assert nom_acq["threat_type"] == "NOMINAL_ASTRONOMICAL_ALIGNMENT"

    # Relativistic Doppler / pointing error detection
    pointing_err = deep_space_laser_mesh.acquire_deepspace_beam(
        terminal_id="dsoc-terminal-earth-palomar",
        point_ahead_angle_urad=1.48,  # > 1.35 urad
        doppler_shift_ghz=18.5,       # > 15 GHz
        photon_snr_db=2.1,            # < 3 dB
    )
    assert pointing_err["threat_detected"] is True
    assert pointing_err["threat_type"] == "ASTRONOMICAL_BEAM_POINTING_DESYNC"
    assert pointing_err["action_recommended"] == "ENGAGE_FAST_STEERING_MIRROR_CLOSED_LOOP"

    # Transmit authenticated DSOC photon frame
    tx = deep_space_laser_mesh.transmit_authenticated_dsoc_frame(
        terminal_id="dsoc-terminal-lunar-gateway",
        payload_size_kb=2048,
        pqc_cipher="ML-KEM-1024_LDPC",
    )
    assert tx["frame_delivery_verified"] is True
    assert tx["single_event_upset_protection"] is True
    assert tx["one_way_light_time_sec"] > 1.0

    # Metrics
    metrics = deep_space_laser_mesh.get_deepspace_metrics()
    assert metrics["active_interplanetary_terminals"] >= 3
    assert metrics["total_authenticated_frames_relayed"] >= 1


# ----------------------------------------------------
# 3. Capability 61: Hypersonic Interceptor Tests
# ----------------------------------------------------
def test_hypersonic_interceptor_service():
    threats = hypersonic_interceptor.list_threats()
    assert len(threats) >= 3
    threat_ids = [t["threat_id"] for t in threats]
    assert "threat-hgv-glider-avangard" in threat_ids
    assert "threat-scramjet-zircon-02" in threat_ids

    # Query threat
    avangard = hypersonic_interceptor.get_threat("threat-hgv-glider-avangard")
    assert avangard is not None
    assert avangard["velocity_mach"] > 20.0
    assert avangard["cross_range_maneuver"] == "ATMOSPHERIC_SKIP_GLIDE"

    # Nominal tracking below hypersonic threshold
    nom_track = hypersonic_interceptor.track_hypersonic_glide_path(
        threat_id="threat-scramjet-zircon-02",
        measured_mach=2.0,
        altitude_km=8.0,
        skip_glide_detected=False,
        plasma_blackout_active=False,
    )
    assert nom_track["threat_detected"] is False
    assert nom_track["threat_type"] == "NOMINAL_AIRSPACE_TRAJECTORY"

    # Extreme velocity Mach 24.5 HGV skip-glide detection
    hgv_track = hypersonic_interceptor.track_hypersonic_glide_path(
        threat_id="threat-hgv-glider-avangard",
        measured_mach=24.5,
        altitude_km=68.0,
        skip_glide_detected=True,
        plasma_blackout_active=True,
    )
    assert hgv_track["threat_detected"] is True
    assert hgv_track["threat_type"] == "EXTREME_VELOCITY_HGV_ATMOSPHERIC_SKIP"
    assert hgv_track["threat_level"] == "EXTREME_CRITICAL"
    assert hgv_track["plasma_cutoff_freq_ghz"] > 35.0
    assert hgv_track["action_recommended"] == "FIRE_EXO_ATMOSPHERIC_KILL_VEHICLE"

    # Fire hypersonic interceptor (sub-2.4ms fire control)
    intercept = hypersonic_interceptor.fire_hypersonic_interceptor(
        threat_id="threat-hgv-glider-avangard",
        interceptor_type="DIRECTED_ENERGY_OPTICAL_LASER_EKV",
        fire_control_latency_ms=2.1,
    )
    assert intercept["kinetic_kill_verified"] is True
    assert intercept["debris_burnup_guaranteed"] is True
    assert intercept["fire_control_latency_ms"] < 2.4
    assert intercept["new_threat_status"] == "NEUTRALIZED_KINETIC_KILL"

    # Metrics
    metrics = hypersonic_interceptor.get_hypersonic_defense_metrics()
    assert metrics["active_hypersonic_threats_tracked"] >= 3
    assert metrics["hypersonic_threats_neutralized"] >= 1
    assert metrics["kinetic_intercept_success_rate_pct"] == 100.0


# ----------------------------------------------------
# 4. Wave 13 Authenticated FastAPI Endpoints Integration
# ----------------------------------------------------
def test_wave13_api_routes(client):
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "usr-sovereign-operator-01",
        "email": "operator@sovereign.defense.gov",
        "role": "SOVEREIGN_ADMIN",
    }

    try:
        # Neuromorphic SNN routes
        res = client.get("/neuromorphic-snn/cores")
        assert res.status_code == 200
        assert len(res.json()["cores"]) >= 3

        res_snn = client.post("/neuromorphic-snn/classify-spikes", json={
            "core_id": "core-loihi2-edge-01",
            "mean_spike_rate_mhz": 125.0,
            "aer_inter_arrival_jitter_ns": 55.0,
            "voltage_anomaly_mv": 140.0,
            "bus_payload_entropy": 7.2,
        })
        assert res_snn.status_code == 200
        assert res_snn.json()["classification"]["threat_detected"] is True

        res_clamp = client.post("/neuromorphic-snn/inject-clamp", json={
            "core_id": "core-loihi2-edge-01",
            "clamp_line": "BUS_LINE_RESET_ISOLATE",
            "response_latency_ns": 380.0,
        })
        assert res_clamp.status_code == 200
        assert res_clamp.json()["clamp"]["hardware_bus_isolated"] is True

        res_snn_met = client.get("/neuromorphic-snn/metrics")
        assert res_snn_met.status_code == 200

        # Deep-Space Laser routes
        res = client.get("/deep-space-laser/terminals")
        assert res.status_code == 200
        assert len(res.json()["terminals"]) >= 3

        res_dsoc = client.post("/deep-space-laser/acquire-beam", json={
            "terminal_id": "dsoc-terminal-mars-recon-01",
            "point_ahead_angle_urad": 1.42,
            "doppler_shift_ghz": 16.5,
            "photon_snr_db": 2.5,
        })
        assert res_dsoc.status_code == 200
        assert res_dsoc.json()["acquisition"]["threat_detected"] is True

        res_tx = client.post("/deep-space-laser/transmit-frame", json={
            "terminal_id": "dsoc-terminal-mars-recon-01",
            "payload_size_kb": 1024,
            "pqc_cipher": "ML-KEM-1024_LDPC",
        })
        assert res_tx.status_code == 200
        assert res_tx.json()["transmission"]["frame_delivery_verified"] is True

        res_dsoc_met = client.get("/deep-space-laser/metrics")
        assert res_dsoc_met.status_code == 200

        # Hypersonic Defense routes
        res = client.get("/hypersonic-defense/threats")
        assert res.status_code == 200
        assert len(res.json()["threats"]) >= 3

        res_hgv = client.post("/hypersonic-defense/track-glide-path", json={
            "threat_id": "threat-waverider-glide-03",
            "measured_mach": 18.0,
            "altitude_km": 55.0,
            "skip_glide_detected": True,
            "plasma_blackout_active": True,
        })
        assert res_hgv.status_code == 200
        assert res_hgv.json()["tracking"]["threat_detected"] is True

        res_kill = client.post("/hypersonic-defense/fire-interceptor", json={
            "threat_id": "threat-waverider-glide-03",
            "interceptor_type": "DIRECTED_ENERGY_OPTICAL_LASER_EKV",
            "fire_control_latency_ms": 1.9,
        })
        assert res_kill.status_code == 200
        assert res_kill.json()["interception"]["kinetic_kill_verified"] is True

        res_hyp_met = client.get("/hypersonic-defense/metrics")
        assert res_hyp_met.status_code == 200
    finally:
        app.dependency_overrides.clear()

