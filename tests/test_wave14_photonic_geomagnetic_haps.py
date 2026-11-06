"""
Test Suite for Wave 14: Photonic Quantum Computing Co-Processor, Geomagnetic Solar Shield & HAPS Swarm (v4.7.0 Milestone):
1. Capability 62: Photonic Optical Quantum Computing Cryptanalytic Co-Processor & Lattice Decryption Firewall (photonic_quantum_firewall)
2. Capability 63: Autonomous Geomagnetic Solar Storm (CME) Induced GIC Power Grid Shielding (geomagnetic_solar_shield)
3. Capability 64: Sub-Millimeter High-Altitude Pseudo-Satellite (HAPS) Stratospheric Persistent Surveillance Swarm (haps_stratosphere_mesh)
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import get_current_user
from app.services.photonic_quantum.photonic_quantum_firewall import photonic_quantum_firewall
from app.services.geomagnetic_shield.geomagnetic_solar_shield import geomagnetic_solar_shield
from app.services.haps_stratosphere.haps_stratosphere_mesh import haps_stratosphere_mesh


@pytest.fixture
def client():
    return TestClient(app)


# ----------------------------------------------------
# 1. Capability 62: Photonic Quantum Firewall Tests
# ----------------------------------------------------
def test_photonic_quantum_service():
    coprocessors = photonic_quantum_firewall.list_coprocessors()
    assert len(coprocessors) >= 3
    coprocessor_ids = [c["coprocessor_id"] for c in coprocessors]
    assert "photonic-borealis-cvq-01" in coprocessor_ids
    assert "photonic-mzi-mesh-silicon-02" in coprocessor_ids

    # Query individual co-processor
    borealis = photonic_quantum_firewall.get_coprocessor("photonic-borealis-cvq-01")
    assert borealis is not None
    assert borealis["optical_modes"] == 216
    assert borealis["optical_gate_latency_fs"] < 120.0

    # Nominal lattice evaluation
    nom = photonic_quantum_firewall.evaluate_lattice_cryptanalysis(
        coprocessor_id="photonic-borealis-cvq-01",
        lattice_dimension=1024,
        target_pqc_scheme="ML-KEM-1024",
        root_hermite_factor=1.0045,
        photon_loss_rate_pct=1.2,
    )
    assert nom["threat_detected"] is False
    assert nom["threat_type"] == "NOMINAL_LATTICE_QUANTUM_HARDNESS"
    assert nom["estimated_classical_bit_security"] >= 256

    # Photonic Shortest Vector Problem (SVP) lattice reduction exploit (< 1.0035)
    threat = photonic_quantum_firewall.evaluate_lattice_cryptanalysis(
        coprocessor_id="photonic-borealis-cvq-01",
        lattice_dimension=384,  # Deprecated lattice dimension
        target_pqc_scheme="ML-KEM-512",
        root_hermite_factor=1.0028,
        photon_loss_rate_pct=0.8,
    )
    assert threat["threat_detected"] is True
    assert threat["threat_type"] == "PHOTONIC_SVP_LATTICE_REDUCTION_EXPLOIT"
    assert threat["action_recommended"] == "ENGAGE_PHOTONIC_OPTICAL_NOISE_FIREWALL"

    # Engage photonic optical noise firewall
    firewall = photonic_quantum_firewall.engage_photonic_firewall(
        coprocessor_id="photonic-borealis-cvq-01",
        defense_mode="OPTICAL_NOISE_INJECTION_BARRIER",
    )
    assert firewall["adversarial_decoherence_enforced"] is True
    assert firewall["quantum_fidelity_degradation_pct"] > 90.0
    assert firewall["optical_response_latency_fs"] < 120.0

    # Metrics
    metrics = photonic_quantum_firewall.get_photonic_metrics()
    assert metrics["active_photonic_coprocessors"] >= 3
    assert metrics["total_optical_modes_monitored"] >= 300
    assert metrics["cryptanalytic_attacks_neutralized"] >= 1


# ----------------------------------------------------
# 2. Capability 63: Geomagnetic Solar Shield Tests
# ----------------------------------------------------
def test_geomagnetic_shield_service():
    substations = geomagnetic_solar_shield.list_substations()
    assert len(substations) >= 3
    substation_ids = [s["substation_id"] for s in substations]
    assert "substation-quebec-hydro-01" in substation_ids
    assert "substation-nordic-grid-02" in substation_ids

    # Query individual substation
    hydro = geomagnetic_solar_shield.get_substation("substation-quebec-hydro-01")
    assert hydro is not None
    assert hydro["voltage_class_kv"] == 735.0
    assert hydro["neutral_blocking_capacitor_installed"] is True

    # Nominal magnetosphere field
    nom = geomagnetic_solar_shield.evaluate_geomagnetic_storm(
        substation_id="substation-pjm-east-03",
        kp_index=3.2,
        db_dt_nt_per_min=45.0,
        measured_gic_amps=4.5,
    )
    assert nom["threat_detected"] is False
    assert nom["threat_type"] == "NOMINAL_MAGNETOSPHERE_FIELD"
    assert nom["action_recommended"] == "CONTINUE_PMU_MONITORING"

    # Catastrophic CME Coronal Mass Ejection (Kp = 9.0, GIC > 100A, dB/dt > 800)
    cme = geomagnetic_solar_shield.evaluate_geomagnetic_storm(
        substation_id="substation-quebec-hydro-01",
        kp_index=9.0,
        db_dt_nt_per_min=1250.0,
        measured_gic_amps=148.0,
    )
    assert cme["threat_detected"] is True
    assert cme["threat_level"] == "EXTREME_CRITICAL"
    assert cme["threat_type"] == "CATASTROPHIC_CME_TRANSFORMER_CORE_SATURATION"
    assert cme["action_recommended"] == "TRIP_NEUTRAL_SERIES_BLOCKING_CAPACITOR"
    assert cme["reactive_power_loss_mvar"] > 50.0

    # Trigger series capacitor neutral blocking
    blocking = geomagnetic_solar_shield.trigger_neutral_blocking_shield(
        substation_id="substation-quebec-hydro-01",
        damping_resistance_ohms=15.0,
        tripping_latency_ms=8.9,
    )
    assert blocking["transformer_core_burnout_prevented"] is True
    assert blocking["tripping_speed_ms"] < 12.0
    assert blocking["quenched_gic_reduction_pct"] > 95.0
    assert blocking["residual_gic_amps"] < 2.0

    # Metrics
    metrics = geomagnetic_solar_shield.get_geomagnetic_metrics()
    assert metrics["monitored_ehv_substations"] >= 3
    assert metrics["total_ehv_transformers_shielded"] >= 18
    assert metrics["neutral_blocking_interventions"] >= 1


# ----------------------------------------------------
# 3. Capability 64: Stratospheric HAPS Swarm Tests
# ----------------------------------------------------
def test_haps_stratosphere_service():
    nodes = haps_stratosphere_mesh.list_nodes()
    assert len(nodes) >= 3
    node_ids = [n["node_id"] for n in nodes]
    assert "haps-zephyr-norfolk-01" in node_ids
    assert "haps-stratobus-malacca-02" in node_ids

    # Query individual node
    zephyr = haps_stratosphere_mesh.get_node("haps-zephyr-norfolk-01")
    assert zephyr is not None
    assert zephyr["altitude_km"] > 18.0
    assert zephyr["sar_resolution_m"] <= 0.20

    # Nominal flight
    nom = haps_stratosphere_mesh.monitor_stratospheric_flight_and_sar(
        node_id="haps-zephyr-norfolk-01",
        wind_velocity_mps=14.0,
        battery_soc_pct=85.0,
        sar_clutter_ratio_db=3.2,
        optical_link_jitter_urad=1.1,
    )
    assert nom["threat_detected"] is False
    assert nom["threat_type"] == "NOMINAL_STRATOSPHERIC_SURVEILLANCE"
    assert nom["station_keeping_efficiency_pct"] > 80.0

    # High-speed jet stream wind shear threat (> 35 m/s)
    jet_stream = haps_stratosphere_mesh.monitor_stratospheric_flight_and_sar(
        node_id="haps-zephyr-norfolk-01",
        wind_velocity_mps=42.5,
        battery_soc_pct=40.0,
        sar_clutter_ratio_db=8.5,
        optical_link_jitter_urad=4.2,
    )
    assert jet_stream["threat_detected"] is True
    assert jet_stream["threat_level"] == "CRITICAL"
    assert jet_stream["threat_type"] == "STRATOSPHERIC_JET_STREAM_SHEAR_DRIFT"
    assert jet_stream["action_recommended"] == "ACTIVATE_MAX_AERO_THRUST_STATION_KEEPING"

    # Relay sub-millimeter SAR telemetry
    telemetry = haps_stratosphere_mesh.relay_submillimeter_sar_telemetry(
        node_id="haps-zephyr-norfolk-01",
        frame_resolution_meters=0.15,
        pqc_cipher="ML-DSA-87_AES256GCM",
    )
    assert telemetry["synthetic_aperture_radar_lock"] is True
    assert telemetry["sar_resolution_meters"] == 0.15
    assert telemetry["pqc_signature_algorithm"] == "ML-DSA-87_AES256GCM"

    # Metrics
    metrics = haps_stratosphere_mesh.get_haps_metrics()
    assert metrics["active_stratospheric_haps_nodes"] >= 3
    assert metrics["mean_operating_altitude_km"] > 19.0


# ----------------------------------------------------
# 4. Wave 14 FastAPI Router Integration Tests
# ----------------------------------------------------
def test_wave14_fastapi_endpoints(client):
    app.dependency_overrides[get_current_user] = lambda: {
        "id": "test-admin",
        "username": "admin",
        "role": "ADMIN",
        "scopes": ["*"],
    }

    try:
        # Photonic Quantum Router
        r1 = client.get("/photonic-quantum/coprocessors")
        assert r1.status_code == 200
        assert r1.json()["status"] == "success"

        r2 = client.post(
            "/photonic-quantum/evaluate-lattice",
            json={
                "coprocessor_id": "photonic-borealis-cvq-01",
                "lattice_dimension": 1024,
                "target_pqc_scheme": "ML-KEM-1024",
                "root_hermite_factor": 1.0045,
                "photon_loss_rate_pct": 1.2,
            },
        )
        assert r2.status_code == 200
        assert r2.json()["evaluation"]["threat_detected"] is False

        r3 = client.post(
            "/photonic-quantum/engage-firewall",
            json={
                "coprocessor_id": "photonic-borealis-cvq-01",
                "defense_mode": "OPTICAL_NOISE_INJECTION_BARRIER",
            },
        )
        assert r3.status_code == 200
        assert r3.json()["firewall_event"]["adversarial_decoherence_enforced"] is True

        r4 = client.get("/photonic-quantum/metrics")
        assert r4.status_code == 200

        # Geomagnetic Solar Shield Router
        r5 = client.get("/geomagnetic-shield/substations")
        assert r5.status_code == 200
        assert r5.json()["status"] == "success"

        r6 = client.post(
            "/geomagnetic-shield/evaluate-storm",
            json={
                "substation_id": "substation-quebec-hydro-01",
                "kp_index": 9.0,
                "db_dt_nt_per_min": 1200.0,
                "measured_gic_amps": 125.0,
            },
        )
        assert r6.status_code == 200
        assert r6.json()["evaluation"]["threat_detected"] is True

        r7 = client.post(
            "/geomagnetic-shield/trigger-blocking",
            json={
                "substation_id": "substation-quebec-hydro-01",
                "damping_resistance_ohms": 12.5,
                "tripping_latency_ms": 9.4,
            },
        )
        assert r7.status_code == 200
        assert r7.json()["blocking_event"]["transformer_core_burnout_prevented"] is True

        r8 = client.get("/geomagnetic-shield/metrics")
        assert r8.status_code == 200

        # HAPS Stratosphere Router
        r9 = client.get("/haps-stratosphere/nodes")
        assert r9.status_code == 200
        assert r9.json()["status"] == "success"

        r10 = client.post(
            "/haps-stratosphere/monitor-flight",
            json={
                "node_id": "haps-zephyr-norfolk-01",
                "wind_velocity_mps=12.0": 12.0,  # test field
                "wind_velocity_mps": 12.0,
                "battery_soc_pct": 88.0,
                "sar_clutter_ratio_db": 2.5,
                "optical_link_jitter_urad": 1.2,
            },
        )
        assert r10.status_code == 200
        assert r10.json()["flight_monitor"]["threat_detected"] is False

        r11 = client.post(
            "/haps-stratosphere/relay-sar",
            json={
                "node_id": "haps-zephyr-norfolk-01",
                "frame_resolution_meters": 0.15,
                "pqc_cipher": "ML-DSA-87_AES256GCM",
            },
        )
        assert r11.status_code == 200
        assert r11.json()["telemetry_event"]["synthetic_aperture_radar_lock"] is True

        r12 = client.get("/haps-stratosphere/metrics")
        assert r12.status_code == 200

    finally:
        app.dependency_overrides.pop(get_current_user, None)

