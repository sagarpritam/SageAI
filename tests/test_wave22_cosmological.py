"""
Unit & Integration Tests for Wave 22: Cosmological de Sitter Horizon, Calabi-Yau Compactification,
Cauchy Horizon Chronology Protector & Planetary Hyperspectral Interceptor Swarm (Capabilities 86-88 + Option B).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.desitter_repulsion_grid import desitter_repulsion_grid
from app.services.calabi_yau_stabilizer import calabi_yau_stabilizer
from app.services.cauchy_chronology_protector import cauchy_chronology_protector
from app.services.hyperspectral_interceptor import hyperspectral_interceptor_swarm

client = TestClient(app)


# ---------------------------------------------------------------------------
# Capability 86: Cosmological de Sitter Horizon Casimir-Polder Repulsion Grid
# ---------------------------------------------------------------------------
def test_desitter_repulsion_service():
    nodes = desitter_repulsion_grid.list_nodes()
    assert len(nodes) >= 3
    node = nodes[0]
    assert "grid_id" in node
    assert "metamaterial_dipole_density_cm3" in node
    assert "vacuum_repulsion_force_nn" in node

    res = desitter_repulsion_grid.generate_repulsion_barrier(
        grid_id="DESITTER-GRID-MAUNA-KEA-01",
        target_metric_region="LOCAL_INERTIAL_FRAME_SEC_1",
        coupling_gain=1.2,
    )
    assert res["event_id"].startswith("DESITTER-REPULSION-")
    assert res["repulsive_metric_force_nn"] > 0.0
    assert res["curvature_screening_efficiency_pct"] > 98.0
    assert res["cosmological_expansion_decoupled"] is True
    assert res["status"] == "CASIMIR_POLDER_REPULSION_ACTIVE"

    metrics = desitter_repulsion_grid.get_grid_metrics()
    assert metrics["active_desitter_nodes"] >= 3
    assert metrics["completed_repulsion_events"] >= 1
    assert metrics["status"] == "OPERATIONAL"


def test_desitter_repulsion_api():
    r_grids = client.get("/api/desitter-repulsion/grids")
    assert r_grids.status_code == 200
    grids = r_grids.json()
    assert len(grids) >= 3

    r_gen = client.post(
        "/api/desitter-repulsion/generate-repulsion",
        json={
            "grid_id": "DESITTER-GRID-SOUTH-POLE-02",
            "target_metric_region": "TEST_SECTOR_POLAR",
            "coupling_gain": 1.0,
        },
    )
    assert r_gen.status_code == 200
    data = r_gen.json()
    assert data["grid_id"] == "DESITTER-GRID-SOUTH-POLE-02"
    assert data["repulsive_metric_force_nn"] > 0.0

    r_metrics = client.get("/api/desitter-repulsion/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------------------------
# Capability 87: 10D Superstring Calabi-Yau Moduli Stabilizer
# ---------------------------------------------------------------------------
def test_calabi_yau_service():
    manifolds = calabi_yau_stabilizer.list_manifolds()
    assert len(manifolds) >= 3
    m = manifolds[0]
    assert "manifold_id" in m
    assert "hodge_number_h11" in m
    assert "hodge_number_h21" in m
    assert m["euler_characteristic"] == 2 * (m["hodge_number_h11"] - m["hodge_number_h21"])

    res = calabi_yau_stabilizer.stabilize_moduli(
        manifold_id="CY3-QUINTIC-P4-01",
        target_volume_string_units=55.0,
        flux_intensity_factor=1.1,
    )
    assert res["result_id"].startswith("CALABI-YAU-STAB-")
    assert res["kahler_moduli_mass_gev"] > 1e13
    assert res["anti_d3_uplift_energy_gev"] > 1e15
    assert res["topological_invariance_verified"] is True
    assert res["status"] == "EXTRA_DIMENSIONS_COMPACTIFICATION_STABLE"

    metrics = calabi_yau_stabilizer.get_stabilization_metrics()
    assert metrics["registered_calabi_yau_threefolds"] >= 3
    assert metrics["completed_stabilizations"] >= 1
    assert metrics["status"] == "OPERATIONAL"


def test_calabi_yau_api():
    r_man = client.get("/api/calabi-yau/manifolds")
    assert r_man.status_code == 200
    assert len(r_man.json()) >= 3

    r_stab = client.post(
        "/api/calabi-yau/stabilize-moduli",
        json={
            "manifold_id": "CY3-BICUBIC-P2XP2-02",
            "target_volume_string_units": 50.0,
            "flux_intensity_factor": 1.0,
        },
    )
    assert r_stab.status_code == 200
    data = r_stab.json()
    assert data["manifold_id"] == "CY3-BICUBIC-P2XP2-02"
    assert data["topological_invariance_verified"] is True

    r_metrics = client.get("/api/calabi-yau/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------------------------
# Capability 88: Cauchy Horizon Quantum Chronology Protector
# ---------------------------------------------------------------------------
def test_cauchy_chronology_service():
    horizons = cauchy_chronology_protector.list_horizons()
    assert len(horizons) >= 3
    h = horizons[0]
    assert "horizon_id" in h
    assert "spacetime_metric_type" in h
    assert "chronology_protection_margin_db" in h

    res = cauchy_chronology_protector.clamp_cauchy_chronology_violation(
        horizon_id="CAUCHY-HORIZON-KERR-01",
        simulated_blueshift_factor=1.5e12,
    )
    assert res["action_id"].startswith("CHRONO-CLAMP-")
    assert res["divergence_suppression_ratio_db"] > 90.0
    assert res["closed_timelike_loop_prevented"] is True
    assert res["status"] == "CHRONOLOGY_PROTECTION_CONJECTURE_ENFORCED"

    metrics = cauchy_chronology_protector.get_chronology_metrics()
    assert metrics["monitored_cauchy_horizons"] >= 3
    assert metrics["enforced_chronology_actions"] >= 1
    assert metrics["causality_violation_rate"] == 0.0
    assert metrics["status"] == "OPERATIONAL"


def test_cauchy_chronology_api():
    r_hor = client.get("/api/cauchy-chronology/horizons")
    assert r_hor.status_code == 200
    assert len(r_hor.json()) >= 3

    r_clamp = client.post(
        "/api/cauchy-chronology/clamp-ctc",
        json={
            "horizon_id": "CAUCHY-HORIZON-GODEL-02",
            "simulated_blueshift_factor": 2.0e12,
        },
    )
    assert r_clamp.status_code == 200
    data = r_clamp.json()
    assert data["closed_timelike_loop_prevented"] is True

    r_metrics = client.get("/api/cauchy-chronology/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------------------------
# Option B: Planetary Hyperspectral Interceptor Swarm
# ---------------------------------------------------------------------------
def test_hyperspectral_interceptor_service():
    sats = hyperspectral_interceptor_swarm.list_satellites()
    assert len(sats) >= 4
    sat = sats[0]
    assert "satellite_id" in sat
    assert "ground_sample_distance_m" in sat
    assert sat["spectral_bands_count"] == 288

    scan_res = hyperspectral_interceptor_swarm.scan_target_region(
        satellite_id="HYPER-SAT-POLAR-01",
        target_coordinates="34.0522°N, 51.4215°E",
        suspected_classification="COVERT_NUCLEAR_ENRICHMENT",
    )
    assert scan_res["scan_id"].startswith("HYPER-SCAN-")
    assert "UF6" in scan_res["spectral_absorption_signature"]
    assert scan_res["confidence_score_pct"] > 95.0

    eng_res = hyperspectral_interceptor_swarm.engage_target(
        scan_id=scan_res["scan_id"],
        interceptor_platform="SPACE_GROUND_KINETIC_ROD",
    )
    assert eng_res["engagement_id"].startswith("ENGAGE-")
    assert eng_res["kill_probability_pct"] > 95.0
    assert eng_res["cross_cue_latency_ms"] < 25.0
    assert eng_res["status"] == "AUTONOMOUS_INTERCEPTOR_CROSS_CUED"

    metrics = hyperspectral_interceptor_swarm.get_swarm_metrics()
    assert metrics["active_hyperspectral_satellites"] >= 4
    assert metrics["total_scans_completed"] >= 1
    assert metrics["total_interceptor_engagements"] >= 1
    assert metrics["constellation_status"] == "FULL_PLANETARY_COVERAGE_LOCKED"


def test_hyperspectral_interceptor_api():
    r_const = client.get("/api/hyperspectral-interceptor/constellation")
    assert r_const.status_code == 200
    assert len(r_const.json()) >= 4

    r_scan = client.post(
        "/api/hyperspectral-interceptor/scan-target",
        json={
            "satellite_id": "HYPER-SAT-EQUATORIAL-03",
            "target_coordinates": "31.2001°N, 35.7891°E",
            "suspected_classification": "REINFORCED_UNDERGROUND_BUNKER",
        },
    )
    assert r_scan.status_code == 200
    scan_data = r_scan.json()
    assert scan_data["thermal_delta_t_kelvin"] > 0.0

    r_eng = client.post(
        "/api/hyperspectral-interceptor/engage-target",
        json={
            "scan_id": scan_data["scan_id"],
            "interceptor_platform": "HIGH_ENERGY_ORBITAL_LASER",
        },
    )
    assert r_eng.status_code == 200
    eng_data = r_eng.json()
    assert eng_data["status"] == "AUTONOMOUS_INTERCEPTOR_CROSS_CUED"

    r_metrics = client.get("/api/hyperspectral-interceptor/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["total_spectral_bands"] == 288
