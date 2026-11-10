"""
Test Suite for Wave 16: Deep-Underground Neutrino Array, Cognitive EW & Optical Atomic Clock Mesh (v4.9.0 Milestone):
1. Capability 68: Global Deep-Underground Neutrino-Flux Tamper & Nuclear Detonation Early Warning Array (neutrino_flux_detector)
2. Capability 69: Cognitive Electronic Warfare (EW) Autonomous Radar Waveform Synthesis & Deception (cognitive_ew_engine)
3. Capability 70: Post-Quantum Planetary Sovereign Time-Synchronization Mesh (optical_atomic_clock_mesh)
"""

import pytest
from fastapi.testclient import TestClient

from app.core.security import get_current_user
from app.main import app
from app.services.atomic_clock_mesh.optical_atomic_clock_mesh import (
    optical_atomic_clock_mesh,
)
from app.services.cognitive_ew.cognitive_ew_engine import cognitive_ew_engine
from app.services.neutrino_array.neutrino_flux_detector import neutrino_flux_detector


@pytest.fixture
def client():
    return TestClient(app)


# ----------------------------------------------------
# 1. Capability 68: Deep-Underground Neutrino Array Tests
# ----------------------------------------------------
def test_neutrino_array_service():
    detectors = neutrino_flux_detector.list_detectors()
    assert len(detectors) >= 4
    d_ids = [d["detector_id"] for d in detectors]
    assert "detector-icecube-southpole-01" in d_ids
    assert "detector-superk-kamioka-02" in d_ids
    assert "detector-sno-ontario-03" in d_ids
    assert "detector-gransasso-lngs-04" in d_ids

    icecube = neutrino_flux_detector.get_detector("detector-icecube-southpole-01")
    assert icecube is not None
    assert icecube["depth_km"] > 2.0
    assert icecube["optical_sensors_count"] > 5000

    # Nominal cosmic background analysis
    nom = neutrino_flux_detector.analyze_neutrino_flux(
        detector_id="detector-icecube-southpole-01",
        observed_prompt_energy_mev=2.4,
        delayed_coincidence_time_us=24.0,
        measured_flux_ev_per_day=145.0,
        zenith_angle_deg=45.0,
        azimuth_angle_deg=180.0,
    )
    assert nom["threat_level"] == "NOMINAL_COSMIC_SOLAR_BACKGROUND"
    assert nom["status"] == "GEONEUTRINO_BACKGROUND_STABLE"
    assert nom["neutrino_energy_mev"] == pytest.approx(3.18, 0.01)

    # Prompt nuclear burst detonation
    burst = neutrino_flux_detector.analyze_neutrino_flux(
        detector_id="detector-superk-kamioka-02",
        observed_prompt_energy_mev=18.5,
        delayed_coincidence_time_us=12.0,
        measured_flux_ev_per_day=520.0,
        zenith_angle_deg=30.0,
        azimuth_angle_deg=225.0,
    )
    assert burst["threat_level"] == "CRITICAL_PROMPT_NUCLEAR_BURST"
    assert burst["status"] == "IMMEDIATE_PLANETARY_NUCLEAR_ALERT"
    assert burst["estimated_thermal_power_gw"] > 50.0

    # Multi-lateral triangulation
    triang = neutrino_flux_detector.triangulate_fissile_event(
        event_label="PROMPT_BURST_EVENT_ALPHA",
        reported_azimuth_angles={
            "detector-icecube-southpole-01": 180.0,
            "detector-superk-kamioka-02": 225.0,
        },
        estimated_source_distance_km=920.0,
    )
    assert (
        triang["verification_status"] == "MULTILATERAL_CHERENKOV_CONVERGENCE_CONFIRMED"
    )
    assert triang["confidence_score"] > 0.95
    assert len(triang["participating_detectors"]) == 2

    # Global metrics
    metrics = neutrino_flux_detector.get_metrics()
    assert metrics["total_detectors_online"] >= 4
    assert metrics["total_subterranean_target_mass_kton"] > 1000.0


def test_neutrino_array_endpoints(client):
    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "test-ciso",
        "role": "admin",
    }
    try:
        r1 = client.get("/neutrino-array/detectors")
        assert r1.status_code == 200
        assert len(r1.json()["detectors"]) >= 4

        r2 = client.get("/neutrino-array/detectors/detector-superk-kamioka-02")
        assert r2.status_code == 200
        assert r2.json()["detector"]["target_mass_kton"] == 50.0

        r3 = client.post(
            "/neutrino-array/analyze-flux",
            json={
                "detector_id": "detector-superk-kamioka-02",
                "observed_prompt_energy_mev": 3.8,
                "delayed_coincidence_time_us": 20.0,
                "measured_flux_ev_per_day": 92.0,
                "zenith_angle_deg": 60.0,
                "azimuth_angle_deg": 140.0,
            },
        )
        assert r3.status_code == 200
        assert r3.json()["analysis"]["cherenkov_angle_deg"] > 40.0

        r4 = client.post(
            "/neutrino-array/triangulate-event",
            json={
                "event_label": "TEST_TRIANGULATION",
                "reported_azimuth_angles": {
                    "detector-superk-kamioka-02": 140.0,
                    "detector-sno-ontario-03": 75.0,
                },
                "estimated_source_distance_km": 1100.0,
            },
        )
        assert r4.status_code == 200
        assert "triangulation_id" in r4.json()["triangulation"]

        r5 = client.get("/neutrino-array/metrics")
        assert r5.status_code == 200
        assert r5.json()["metrics"]["total_detectors_online"] >= 4
    finally:
        app.dependency_overrides.clear()


# ----------------------------------------------------
# 2. Capability 69: Cognitive Electronic Warfare Tests
# ----------------------------------------------------
def test_cognitive_ew_service():
    emitters = cognitive_ew_engine.list_emitters()
    assert len(emitters) >= 3
    e_ids = [e["emitter_id"] for e in emitters]
    assert "emitter-aesa-xband-01" in e_ids
    assert "emitter-pesa-sband-02" in e_ids
    assert "emitter-millimeter-kuband-03" in e_ids

    aesa = cognitive_ew_engine.get_emitter("emitter-aesa-xband-01")
    assert aesa is not None
    assert aesa["frequency_ghz"] == 9.85

    # Synthesize RGPO Waveform
    wf_rgpo = cognitive_ew_engine.synthesize_drfm_waveform(
        emitter_id="emitter-aesa-xband-01",
        pulse_descriptor={
            "carrier_frequency_ghz": 9.85,
            "pulse_width_us": 12.5,
            "snr_db": 28.0,
        },
        technique="RANGE_GATE_PULL_OFF_RGPO",
    )
    assert wf_rgpo["synthesis_latency_us"] < 5.0
    assert wf_rgpo["jamming_to_signal_ratio_db"] > 20.0
    assert wf_rgpo["track_break_probability"] > 0.90

    # Synthesize VGPO Waveform
    wf_vgpo = cognitive_ew_engine.synthesize_drfm_waveform(
        emitter_id="emitter-aesa-xband-01",
        pulse_descriptor={"carrier_frequency_ghz": 9.85, "pulse_width_us": 12.5},
        technique="VELOCITY_GATE_PULL_OFF_VGPO",
    )
    assert wf_vgpo["drfm_parameters"]["doppler_shift_khz"] == 45.0
    assert wf_vgpo["track_break_probability"] > 0.95

    # Engage countermeasure
    eng = cognitive_ew_engine.engage_countermeasure(
        emitter_id="emitter-aesa-xband-01",
        technique="RANGE_GATE_PULL_OFF_RGPO",
        duration_ms=300.0,
    )
    assert eng["status"] == "ENGAGEMENT_SUCCESSFUL_TRACK_LOST"
    assert eng["rf_response_latency_us"] < 5.0
    assert eng["effective_rcs_reduction_db"] <= -30.0

    updated_emitter = cognitive_ew_engine.get_emitter("emitter-aesa-xband-01")
    assert updated_emitter is not None
    assert updated_emitter["threat_priority"] == "NEUTRALIZED"

    metrics = cognitive_ew_engine.get_metrics()
    assert metrics["threats_neutralized"] >= 1
    assert metrics["mean_drfm_turnaround_us"] < 5.0


def test_cognitive_ew_endpoints(client):
    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "test-ciso",
        "role": "admin",
    }
    try:
        r1 = client.get("/cognitive-ew/emitters")
        assert r1.status_code == 200
        assert len(r1.json()["emitters"]) >= 3

        r2 = client.get("/cognitive-ew/emitters/emitter-pesa-sband-02")
        assert r2.status_code == 200
        assert r2.json()["emitter"]["frequency_ghz"] == 3.25

        r3 = client.post(
            "/cognitive-ew/synthesize-waveform",
            json={
                "emitter_id": "emitter-pesa-sband-02",
                "carrier_frequency_ghz": 3.25,
                "pulse_width_us": 45.0,
                "snr_db": 22.0,
                "technique": "COHERENT_FALSE_TARGET_SWARM",
            },
        )
        assert r3.status_code == 200
        assert r3.json()["waveform"]["track_break_probability"] > 0.95

        r4 = client.post(
            "/cognitive-ew/engage-countermeasure",
            json={
                "emitter_id": "emitter-pesa-sband-02",
                "technique": "COHERENT_FALSE_TARGET_SWARM",
                "duration_ms": 200.0,
            },
        )
        assert r4.status_code == 200
        assert r4.json()["engagement"]["status"] == "ENGAGEMENT_SUCCESSFUL_TRACK_LOST"

        r5 = client.get("/cognitive-ew/metrics")
        assert r5.status_code == 200
        assert r5.json()["metrics"]["total_emitters_monitored"] >= 3
    finally:
        app.dependency_overrides.clear()


# ----------------------------------------------------
# 3. Capability 70: Post-Quantum Optical Clock Mesh Tests
# ----------------------------------------------------
def test_optical_atomic_clock_service():
    clocks = optical_atomic_clock_mesh.list_clocks()
    assert len(clocks) >= 4
    c_ids = [c["clock_id"] for c in clocks]
    assert "clock-strontium-boulder-01" in c_ids
    assert "clock-ytterbium-ptb-02" in c_ids
    assert "clock-strontium-tokyo-03" in c_ids

    boulder = optical_atomic_clock_mesh.get_clock("clock-strontium-boulder-01")
    assert boulder is not None
    assert boulder["fractional_uncertainty"] <= 1.5e-18

    # Synchronize mesh under nominal fiber jitter
    sync_nom = optical_atomic_clock_mesh.synchronize_mesh(
        primary_clock_id="clock-strontium-boulder-01",
        fiber_link_length_km=1450.0,
        carrier_phase_jitter_fs=3.8,
    )
    assert sync_nom["sync_status"] == "PLANETARY_OPTICAL_COMB_LOCKED"
    assert sync_nom["spoofing_detected"] is False
    assert sync_nom["residual_jitter_fs"] < 1.0

    # Relativistic phase spoofing detection
    sync_spoof = optical_atomic_clock_mesh.synchronize_mesh(
        primary_clock_id="clock-strontium-boulder-01",
        fiber_link_length_km=1450.0,
        carrier_phase_jitter_fs=85.0,  # Abnormal phase shift
    )
    assert sync_spoof["sync_status"] == "RELATIVISTIC_PHASE_SPOOFING_INTERCEPTED"
    assert sync_spoof["spoofing_detected"] is True

    # Generate and verify ML-DSA-87 authenticated timestamp
    ts_record = optical_atomic_clock_mesh.generate_and_verify_timestamp(
        clock_id="clock-strontium-boulder-01",
        payload_data="HASH-SCADA-PMU-TELEMETRY-GRID-9921",
        target_subsystem="SCADA_INTERGRID_PMU",
    )
    assert ts_record["tamper_proof_valid"] is True
    assert ts_record["pqc_algorithm"] == "ML-DSA-87 (FIPS 204 Parameter Set 5)"
    assert len(ts_record["pqc_signature_hex"]) > 32

    metrics = optical_atomic_clock_mesh.get_metrics()
    assert metrics["total_optical_lattice_clocks"] >= 4
    assert metrics["mesh_synchronization_state"] == "PLANETARY_FEMTOSECOND_COHERENCE"


def test_optical_atomic_clock_endpoints(client):
    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "test-ciso",
        "role": "admin",
    }
    try:
        r1 = client.get("/atomic-clock/clocks")
        assert r1.status_code == 200
        assert len(r1.json()["clocks"]) >= 4

        r2 = client.get("/atomic-clock/clocks/clock-ytterbium-ptb-02")
        assert r2.status_code == 200
        assert r2.json()["clock"]["atomic_species"] == "Ytterbium-171 (171Yb)"

        r3 = client.post(
            "/atomic-clock/synchronize-mesh",
            json={
                "primary_clock_id": "clock-strontium-boulder-01",
                "fiber_link_length_km": 1500.0,
                "carrier_phase_jitter_fs": 4.5,
            },
        )
        assert r3.status_code == 200
        assert r3.json()["sync"]["sync_status"] == "PLANETARY_OPTICAL_COMB_LOCKED"

        r4 = client.post(
            "/atomic-clock/generate-timestamp",
            json={
                "clock_id": "clock-strontium-boulder-01",
                "payload_data": "BLOCKCHAIN_PROOF_MERKLE_ROOT_5F92",
                "target_subsystem": "FINANCIAL_LEDGER_AUDIT",
            },
        )
        assert r4.status_code == 200
        assert r4.json()["timestamp_record"]["tamper_proof_valid"] is True

        r5 = client.get("/atomic-clock/metrics")
        assert r5.status_code == 200
        assert r5.json()["metrics"]["total_optical_lattice_clocks"] >= 4
    finally:
        app.dependency_overrides.clear()
