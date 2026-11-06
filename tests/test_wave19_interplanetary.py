"""
Unit & Integration Tests for Wave 19 (Capabilities 77-79) and Option B Continuous Daemon.
"""

import time
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.solar_sail_laser import relativistic_solar_sail_laser_mesh
from app.services.magnetosphere_dynamo import magnetosphere_dynamo_decoupler
from app.services.mantle_geoneutrino import deep_mantle_geoneutrino_mesh
from app.services.autonomous_redteam import autonomous_redteam_daemon

client = TestClient(app)


def test_solar_sail_laser_service():
    arrays = relativistic_solar_sail_laser_mesh.list_arrays()
    assert len(arrays) >= 3
    arr_ids = [a["array_id"] for a in arrays]
    assert "LASER-ARRAY-ATACAMA-01" in arr_ids

    # Relativistic Lightsail target
    sail_res = relativistic_solar_sail_laser_mesh.fire_propulsion_beam(
        array_id="LASER-ARRAY-ATACAMA-01",
        target_type="RELATIVISTIC_LIGHTSAIL",
        target_id="STARSHOT-PROBE-ALPHA-01",
        beam_power_gw=90.0,
        duration_seconds=120.0,
        target_mass_kg=0.001,  # 1 gram Starshot micro-chip
        sail_area_m2=16.0,
        reflectivity=0.9995,
    )
    assert sail_res["event_id"].startswith("LASER-PULSE-")
    assert sail_res["radiation_pressure_pa"] > 0.0
    assert sail_res["total_photonic_thrust_newtons"] > 0.0
    assert sail_res["achieved_delta_v_m_s"] > 1000.0
    assert sail_res["terminal_velocity_fraction_c"] > 0.10
    assert sail_res["strehl_ratio"] >= 0.88
    assert sail_res["status"] == "PULSE_DISCHARGE_SUCCESS"

    # Asteroid deflection target
    ast_res = relativistic_solar_sail_laser_mesh.fire_propulsion_beam(
        array_id="LASER-ARRAY-MAUNA-KEA-02",
        target_type="ASTEROID_HAZARD_DEFLECTION",
        target_id="NEO-ASTEROID-2026-XQ4",
        beam_power_gw=80.0,
        duration_seconds=600.0,
        target_mass_kg=1e7,
        sail_area_m2=500.0,
    )
    assert ast_res["projected_miss_distance_km"] > 0.0

    metrics = relativistic_solar_sail_laser_mesh.get_mesh_metrics()
    assert metrics["active_laser_arrays"] >= 3
    assert metrics["total_phased_power_gw"] >= 200.0
    assert metrics["status"] == "OPERATIONAL"

    with pytest.raises(ValueError):
        relativistic_solar_sail_laser_mesh.fire_propulsion_beam(
            array_id="INVALID-ARRAY",
            target_type="LIGHTSAIL",
            target_id="PROBE",
        )


def test_magnetosphere_dynamo_service():
    stations = magnetosphere_dynamo_decoupler.list_stations()
    assert len(stations) >= 3
    station_ids = [s["station_id"] for s in stations]
    assert "DYNAMO-ORBITAL-COIL-01" in station_ids

    # EMP decoupling response
    res = magnetosphere_dynamo_decoupler.trigger_emp_decoupling(
        station_id="DYNAMO-ORBITAL-COIL-01",
        threat_type="HEMP_NUCLEAR_BURST",
        simulated_e1_kv_m=65.0,
        simulated_rise_time_ns=1.8,
    )
    assert res["decoupling_id"].startswith("EMP-DECOUP-")
    assert res["peak_electric_field_kv_m"] == 65.0
    assert res["clamped_e1_voltage_volts"] < 100.0
    assert res["attenuation_ratio_db"] > 45.0
    assert res["substation_gic_reduced_pct"] > 99.0
    assert res["alfven_wave_injected_amplitude_t"] > 0.0
    assert res["mitigation_latency_ns"] < 1.0
    assert res["verdict"] == "HEMP_SURGE_DECOUPLED_AND_QUENCHED"

    metrics = magnetosphere_dynamo_decoupler.get_dynamo_metrics()
    assert metrics["active_dynamo_stations"] >= 3
    assert metrics["status"] == "OPERATIONAL"

    with pytest.raises(ValueError):
        magnetosphere_dynamo_decoupler.trigger_emp_decoupling("UNKNOWN-STATION")


def test_mantle_geoneutrino_service():
    obs = deep_mantle_geoneutrino_mesh.list_observatories()
    assert len(obs) >= 3
    obs_ids = [o["obs_id"] for o in obs]
    assert "GEON-OBS-JUNO-JIANGMEN" in obs_ids

    # Mantle tomography reconstruction
    res = deep_mantle_geoneutrino_mesh.reconstruct_mantle_tomography(
        region_label="YELLOWSTONE_CALDERA_SUPERPLUME",
        depth_target_km=2890.0,
        observation_days=60.0,
    )
    assert res["inversion_id"].startswith("GEON-INV-")
    assert res["depth_layer_km"] == 2890.0
    assert res["uranium_flux_tnu"] > 20.0
    assert res["thorium_flux_tnu"] > 5.0
    assert res["mantle_heat_flux_tw"] > 15.0
    assert len(res["detected_thermal_plumes"]) >= 1
    assert res["magma_overpressure_status"] == "CRITICAL_CONVECTIVE_OVERPRESSURE_DETECTED"
    assert res["days_to_potential_breach"] > 30.0
    assert res["early_warning_confidence_pct"] > 90.0

    metrics = deep_mantle_geoneutrino_mesh.get_mesh_metrics()
    assert metrics["active_geoneutrino_observatories"] >= 3
    assert metrics["status"] == "OPERATIONAL"


def test_autonomous_redteam_daemon():
    # Start daemon
    start_res = autonomous_redteam_daemon.start_daemon(cycle_interval_seconds=2.0)
    assert start_res["daemon_state"] in ["STARTED_ACTIVE", "ALREADY_RUNNING"]

    status = autonomous_redteam_daemon.get_status()
    assert status["daemon_active"] is True
    assert status["total_ticks"] >= 1
    assert len(status["recent_ticks"]) >= 1

    # Stop daemon
    stop_res = autonomous_redteam_daemon.stop_daemon()
    assert stop_res["daemon_state"] in ["STOPPED", "ALREADY_STOPPED"]


def test_wave19_api_routes():
    # Solar Sail Laser
    r_arr = client.get("/api/solar-sail-laser/arrays")
    assert r_arr.status_code == 200
    assert len(r_arr.json()) >= 3

    r_fire = client.post(
        "/api/solar-sail-laser/fire-pulse",
        json={
            "array_id": "LASER-ARRAY-ATACAMA-01",
            "target_type": "RELATIVISTIC_LIGHTSAIL",
            "target_id": "STARSHOT-PROBE-01",
            "beam_power_gw": 85.0,
            "duration_seconds": 60.0,
            "target_mass_kg": 0.01,
            "sail_area_m2": 16.0,
            "reflectivity": 0.9995,
        },
    )
    assert r_fire.status_code == 200
    assert "event_id" in r_fire.json()

    # Magnetosphere Dynamo
    r_stations = client.get("/api/magnetosphere-dynamo/stations")
    assert r_stations.status_code == 200
    assert len(r_stations.json()) >= 3

    r_decoup = client.post(
        "/api/magnetosphere-dynamo/trigger-decoupling",
        json={
            "station_id": "DYNAMO-ORBITAL-COIL-01",
            "threat_type": "HEMP_NUCLEAR_BURST",
            "simulated_e1_kv_m": 55.0,
            "simulated_rise_time_ns": 2.1,
        },
    )
    assert r_decoup.status_code == 200
    assert r_decoup.json()["verdict"] == "HEMP_SURGE_DECOUPLED_AND_QUENCHED"

    # Mantle Geoneutrino
    r_obs = client.get("/api/mantle-geoneutrino/observatories")
    assert r_obs.status_code == 200
    assert len(r_obs.json()) >= 3

    r_inv = client.post(
        "/api/mantle-geoneutrino/reconstruct-tomography",
        json={
            "region_label": "YELLOWSTONE_CALDERA_SUPERPLUME",
            "depth_target_km": 2890.0,
            "observation_days": 45.0,
        },
    )
    assert r_inv.status_code == 200
    assert "inversion_id" in r_inv.json()

    # Red-Team Daemon API endpoints
    r_daemon_start = client.post(
        "/api/redteam-cluster/daemon/start",
        json={"cycle_interval_seconds": 5.0},
    )
    assert r_daemon_start.status_code == 200

    r_daemon_status = client.get("/api/redteam-cluster/daemon/status")
    assert r_daemon_status.status_code == 200
    assert "total_ticks" in r_daemon_status.json()

    r_daemon_stop = client.post("/api/redteam-cluster/daemon/stop")
    assert r_daemon_stop.status_code == 200
