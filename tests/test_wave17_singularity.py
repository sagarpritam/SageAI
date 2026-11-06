"""
Test Suite for Wave 17: Gravitational Seismic, Counter-Quantum & Spaceborne Plasma Shield (v5.0.0 Milestone):
1. Capability 71: Gravitational Wave Seismic Tamper & Sub-Crustal Tectonic Displacement Mesh (gravitational_seismic_mesh)
2. Capability 72: Autonomous Counter-Quantum Cryptographic Harvest Attack Disruption Matrix (counter_quantum_harvest_matrix)
3. Capability 73: Sovereign Spaceborne Megawatt-Class Directed Energy Plasma Shield Network (spaceborne_plasma_shield)
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import get_current_user
from app.services.gravitational_seismic.gravitational_seismic_mesh import gravitational_seismic_mesh
from app.services.counter_quantum_matrix.counter_quantum_engine import counter_quantum_harvest_matrix
from app.services.plasma_shield_network.spaceborne_plasma_shield import spaceborne_plasma_shield


@pytest.fixture
def client():
    return TestClient(app)


# ----------------------------------------------------
# 1. Capability 71: Gravitational Seismic Mesh Tests
# ----------------------------------------------------
def test_gravitational_seismic_service():
    observatories = gravitational_seismic_mesh.list_observatories()
    assert len(observatories) >= 4
    obs_ids = [o["observatory_id"] for o in observatories]
    assert "gw-obs-kagra-subterra-01" in obs_ids
    assert "gw-obs-einstein-telescope-02" in obs_ids
    assert "gw-obs-cascina-virgo-03" in obs_ids

    kagra = gravitational_seismic_mesh.get_observatory("gw-obs-kagra-subterra-01")
    assert kagra is not None
    assert kagra["arm_length_km"] == 3.0
    assert kagra["test_mass_temp_kelvin"] <= 25.0

    # Nominal microseism analysis
    nom = gravitational_seismic_mesh.analyze_strain_telemetry(
        observatory_id="gw-obs-kagra-subterra-01",
        measured_strain_h=2.4e-21,
        dominant_frequency_hz=0.35,
    )
    assert nom["threat_type"] == "NATURAL_TECTONIC_MICROSEISM"
    assert nom["threat_level"] == "NOMINAL_BACKGROUND"

    # Sub-crustal nuclear detonation shock
    nuc = gravitational_seismic_mesh.analyze_strain_telemetry(
        observatory_id="gw-obs-einstein-telescope-02",
        measured_strain_h=2.8e-19,
        dominant_frequency_hz=12.5,
    )
    assert nuc["threat_type"] == "SUBCRUSTAL_PROMPT_NUCLEAR_DETONATION"
    assert nuc["threat_level"] == "CRITICAL_PLANETARY_SHOCK"
    assert nuc["estimated_yield_kilotons"] > 20.0

    # Geodetic triangulation
    triang = gravitational_seismic_mesh.triangulate_subcrustal_tamper(
        event_label="TEST_SUBCRUSTAL_SHOCK",
        sensor_arrival_times_ms={
            "gw-obs-kagra-subterra-01": 14.2,
            "gw-obs-einstein-telescope-02": 28.5,
        },
        assumed_depth_km=5.2,
    )
    assert triang["verification_status"] == "QUADRUPOLAR_TENSOR_CONVERGENCE_CONFIRMED"
    assert triang["geodetic_coordinates"]["spatial_error_radius_meters"] < 100.0
    assert triang["triangulation_speed_ms"] < 15.0

    metrics = gravitational_seismic_mesh.get_metrics()
    assert metrics["total_laser_observatories"] >= 4
    assert metrics["sub_femtometer_sensitivity_verified"] is True


def test_gravitational_seismic_endpoints(client):
    app.dependency_overrides[get_current_user] = lambda: {"sub": "test-ciso", "role": "admin"}
    try:
        r1 = client.get("/gravitational-seismic/observatories")
        assert r1.status_code == 200
        assert len(r1.json()["observatories"]) >= 4

        r2 = client.get("/gravitational-seismic/observatories/gw-obs-einstein-telescope-02")
        assert r2.status_code == 200
        assert r2.json()["observatory"]["arm_length_km"] == 10.0

        r3 = client.post(
            "/gravitational-seismic/analyze-strain",
            json={
                "observatory_id": "gw-obs-einstein-telescope-02",
                "measured_strain_h": 4.5e-20,
                "dominant_frequency_hz": 28.0,
                "p_wave_velocity_km_s": 6.5,
                "s_wave_velocity_km_s": 3.7,
            },
        )
        assert r3.status_code == 200
        assert r3.json()["analysis"]["threat_type"] == "COVERT_DEEP_TUNNEL_BORING_MACHINE"

        r4 = client.post(
            "/gravitational-seismic/triangulate-tamper",
            json={
                "event_label": "TEST_BORING_LOCALIZATION",
                "sensor_arrival_times_ms": {
                    "gw-obs-kagra-subterra-01": 15.2,
                    "gw-obs-cascina-virgo-03": 31.0,
                },
                "assumed_depth_km": 3.8,
            },
        )
        assert r4.status_code == 200
        assert "triangulation_id" in r4.json()["triangulation"]

        r5 = client.get("/gravitational-seismic/metrics")
        assert r5.status_code == 200
        assert r5.json()["metrics"]["total_laser_observatories"] >= 4
    finally:
        app.dependency_overrides.clear()


# ----------------------------------------------------
# 2. Capability 72: Counter-Quantum Harvest Matrix Tests
# ----------------------------------------------------
def test_counter_quantum_matrix_service():
    interceptors = counter_quantum_harvest_matrix.list_interceptors()
    assert len(interceptors) >= 3
    it_ids = [it["interceptor_id"] for it in interceptors]
    assert "interceptor-transatlantic-tap-01" in it_ids
    assert "interceptor-satellite-downlink-02" in it_ids

    subsea = counter_quantum_harvest_matrix.get_interceptor("interceptor-transatlantic-tap-01")
    assert subsea is not None
    assert subsea["target_pqc_scheme"] == "ML-KEM-1024"

    # Inject honey-chaff
    chaff = counter_quantum_harvest_matrix.inject_quantum_honey_chaff(
        interceptor_id="interceptor-transatlantic-tap-01",
        burst_count=150,
        lattice_dimension=1024,
        entropy_sink_type="TRAPDOOR_EXPONENTIAL_BRANCH_SINK",
    )
    assert chaff["status"] == "CHAFF_POISON_INJECTED_SUCCESSFULLY"
    assert chaff["burst_count"] == 150
    assert chaff["adversary_storage_corrupted_pct"] > 10.0
    assert chaff["estimated_adversary_qpu_burn_hours"] > 2000.0

    # Trigger decoherence
    decoh = counter_quantum_harvest_matrix.trigger_trapdoor_decoherence(
        interceptor_id="interceptor-transatlantic-tap-01",
        target_quantum_algorithm="SHOR_DISCRETE_LOG_OR_LATTICE_BKZ",
    )
    assert decoh["quantum_fidelity_collapse_pct"] >= 99.0
    assert decoh["outcome"] == "ADVERSARIAL_HARVEST_VAULT_SUCCESSFULLY_NEUTRALIZED"

    metrics = counter_quantum_harvest_matrix.get_metrics()
    assert metrics["total_harvest_interceptors"] >= 3
    assert metrics["total_honey_ciphertexts_injected"] > 20000


def test_counter_quantum_matrix_endpoints(client):
    app.dependency_overrides[get_current_user] = lambda: {"sub": "test-ciso", "role": "admin"}
    try:
        r1 = client.get("/counter-quantum/interceptors")
        assert r1.status_code == 200
        assert len(r1.json()["interceptors"]) >= 3

        r2 = client.get("/counter-quantum/interceptors/interceptor-satellite-downlink-02")
        assert r2.status_code == 200
        assert r2.json()["interceptor"]["target_pqc_scheme"] == "ML-DSA-87"

        r3 = client.post(
            "/counter-quantum/inject-honey-chaff",
            json={
                "interceptor_id": "interceptor-satellite-downlink-02",
                "burst_count": 80,
                "lattice_dimension": 1024,
                "entropy_sink_type": "TRAPDOOR_EXPONENTIAL_BRANCH_SINK",
            },
        )
        assert r3.status_code == 200
        assert r3.json()["injection"]["status"] == "CHAFF_POISON_INJECTED_SUCCESSFULLY"

        r4 = client.post(
            "/counter-quantum/trigger-decoherence",
            json={
                "interceptor_id": "interceptor-satellite-downlink-02",
                "target_quantum_algorithm": "PRIMAL_DUAL_LATTICE_BKZ_2_0",
            },
        )
        assert r4.status_code == 200
        assert r4.json()["decoherence"]["quantum_fidelity_collapse_pct"] > 99.0

        r5 = client.get("/counter-quantum/metrics")
        assert r5.status_code == 200
        assert r5.json()["metrics"]["total_harvest_interceptors"] >= 3
    finally:
        app.dependency_overrides.clear()


# ----------------------------------------------------
# 3. Capability 73: Spaceborne Plasma Shield Tests
# ----------------------------------------------------
def test_spaceborne_plasma_shield_service():
    platforms = spaceborne_plasma_shield.list_platforms()
    assert len(platforms) >= 3
    p_ids = [p["platform_id"] for p in platforms]
    assert "plasma-shield-aegis-orbital-01" in p_ids
    assert "plasma-shield-hyperion-geo-02" in p_ids
    assert "plasma-shield-lagrange-l1-03" in p_ids

    aegis = spaceborne_plasma_shield.get_platform("plasma-shield-aegis-orbital-01")
    assert aegis is not None
    assert aegis["magnetic_field_tesla"] >= 8.0
    assert aegis["power_capacity_mw"] >= 2.0

    # Engage plasma window
    win = spaceborne_plasma_shield.engage_plasma_window(
        platform_id="plasma-shield-aegis-orbital-01",
        target_threat_id="HOSTILE-ASAT-KKV-ALPHA",
        incoming_velocity_km_s=8.5,
        estimated_threat_mass_kg=40.0,
    )
    assert win["response_latency_ms"] < 10.0
    assert win["containment_status"] == "HIGH_DENSITY_PLASMA_STANDOFF_ESTABLISHED"
    assert win["threat_kinetic_energy_mj"] > 1000.0

    # Fire deflection relativistic electron beam pulse
    defl = spaceborne_plasma_shield.fire_deflection_pulse(
        platform_id="plasma-shield-aegis-orbital-01",
        target_threat_id="HOSTILE-ASAT-KKV-ALPHA",
        pulse_energy_mj=140.0,
        beam_diameter_cm=16.0,
    )
    assert defl["discharge_speed_ms"] < 10.0
    assert defl["kinetic_kill_neutralized"] is True
    assert defl["new_miss_distance_km"] > 50.0

    metrics = spaceborne_plasma_shield.get_metrics()
    assert metrics["total_shield_platforms"] >= 3
    assert metrics["total_megawatt_capacity"] >= 15.0


def test_spaceborne_plasma_shield_endpoints(client):
    app.dependency_overrides[get_current_user] = lambda: {"sub": "test-ciso", "role": "admin"}
    try:
        r1 = client.get("/plasma-shield/platforms")
        assert r1.status_code == 200
        assert len(r1.json()["platforms"]) >= 3

        r2 = client.get("/plasma-shield/platforms/plasma-shield-hyperion-geo-02")
        assert r2.status_code == 200
        assert r2.json()["platform"]["magnetic_field_tesla"] == 12.0

        r3 = client.post(
            "/plasma-shield/engage-window",
            json={
                "platform_id": "plasma-shield-hyperion-geo-02",
                "target_threat_id": "KKV-INTERCEPTOR-GAMMA-09",
                "incoming_velocity_km_s": 9.2,
                "estimated_threat_mass_kg": 50.0,
            },
        )
        assert r3.status_code == 200
        assert r3.json()["window_event"]["containment_status"] == "HIGH_DENSITY_PLASMA_STANDOFF_ESTABLISHED"

        r4 = client.post(
            "/plasma-shield/fire-pulse",
            json={
                "platform_id": "plasma-shield-hyperion-geo-02",
                "target_threat_id": "KKV-INTERCEPTOR-GAMMA-09",
                "pulse_energy_mj": 150.0,
                "beam_diameter_cm": 18.0,
            },
        )
        assert r4.status_code == 200
        assert r4.json()["deflection_event"]["kinetic_kill_neutralized"] is True

        r5 = client.get("/plasma-shield/metrics")
        assert r5.status_code == 200
        assert r5.json()["metrics"]["total_shield_platforms"] >= 3
    finally:
        app.dependency_overrides.clear()

