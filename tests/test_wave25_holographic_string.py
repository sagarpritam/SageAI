"""
Unit & Integration Tests for Wave 25: Holographic Ryu-Takayanagi Entanglement Siphon,
D-Brane Tadpole Anomaly Filter, Novikov Chrono-Geodesic Normalizer & Hypersonic MHD Plasma Stealth (Capabilities 95-97 + Option B).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ryu_takayanagi_siphon import get_ryu_takayanagi_siphon
from app.services.dbrane_tadpole_filter import get_dbrane_tadpole_filter
from app.services.novikov_geodesic_normalizer import get_novikov_geodesic_normalizer
from app.services.mhd_plasma_stealth import get_mhd_plasma_stealth

client = TestClient(app)


# ---------------------------------------------------------------------------
# Capability 95: Holographic Ryu-Takayanagi Entanglement Entropy Siphon
# ---------------------------------------------------------------------------
def test_ryu_takayanagi_siphon_service():
    siphon = get_ryu_takayanagi_siphon()
    nodes = siphon.list_boundary_nodes()
    assert len(nodes) >= 3
    node = nodes[0]
    assert "node_id" in node
    assert "ads_radius_l_meters" in node
    assert "boundary_central_charge_c" in node

    res = siphon.siphon_boundary_entropy(
        node_id=node["node_id"],
        boundary_subsystem_length_l=150.0,
        siphon_flow_rate_gb_s=64.0,
    )
    assert res["siphon_id"].startswith("RT-SIPHON-")
    assert res["bulk_minimal_surface_area_m2"] > 0.0
    assert res["calculated_entanglement_entropy_nats"] > 0.0
    assert res["siphoned_boundary_entropy_nats"] > 0.0
    assert res["holographic_reconstruction_fidelity_pct"] >= 99.95
    assert res["bulk_asymptotic_boundary_quench_db"] > 40.0
    assert res["status"] == "RYU_TAKAYANAGI_ENTROPY_SIPHONED"

    metrics = siphon.get_siphon_metrics()
    assert metrics["active_holographic_nodes"] >= 3
    assert metrics["completed_entropy_siphons"] >= 1
    assert metrics["mean_reconstruction_fidelity_pct"] >= 99.9


def test_ryu_takayanagi_api_routes():
    r_nodes = client.get("/api/ryu-takayanagi/nodes")
    assert r_nodes.status_code == 200
    nodes = r_nodes.json()
    assert len(nodes) >= 3

    r_siphon = client.post(
        "/api/ryu-takayanagi/siphon-entropy",
        json={
            "node_id": nodes[0]["node_id"],
            "boundary_subsystem_length_l": 120.0,
            "siphon_flow_rate_gb_s": 48.0,
        },
    )
    assert r_siphon.status_code == 200
    res = r_siphon.json()
    assert res["holographic_reconstruction_fidelity_pct"] >= 99.95

    r_metrics = client.get("/api/ryu-takayanagi/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["holographic_framework"] == "RYU_TAKAYANAGI_ADS_CFT_CORRESPONDENCE"


# ---------------------------------------------------------------------------
# Capability 96: D-Brane Ramond-Ramond Charge Tadpole Anomaly Filter
# ---------------------------------------------------------------------------
def test_dbrane_tadpole_filter_service():
    filt = get_dbrane_tadpole_filter()
    stacks = filt.list_stacks()
    assert len(stacks) >= 3
    s = stacks[0]
    assert "stack_id" in s
    assert "ramond_ramond_charge_q" in s
    assert "orientifold_plane_charge_qo" in s

    res = filt.cancel_tadpole_anomaly(
        stack_id=s["stack_id"],
        compensatory_flux_quanta=2,
        green_schwarz_boost=1.5,
    )
    assert res["cancellation_id"].startswith("TADPOLE-FILTER-")
    assert res["green_schwarz_counterterm_injected"] > 0.0
    assert res["tachyonic_modes_excised_count"] >= 1
    assert res["orientifold_plane_equilibrium_locked"] is True
    assert res["status"] == "TADPOLE_ANOMALY_CANCELLED_GAUGE_RESTRICTED"

    metrics = filt.get_filter_metrics()
    assert metrics["monitored_dbrane_stacks"] >= 3
    assert metrics["completed_tadpole_cancellations"] >= 1
    assert metrics["gauge_group_unbroken"] is True


def test_dbrane_tadpole_api_routes():
    r_stacks = client.get("/api/dbrane-tadpole/stacks")
    assert r_stacks.status_code == 200
    stacks = r_stacks.json()
    assert len(stacks) >= 3

    r_cancel = client.post(
        "/api/dbrane-tadpole/cancel-tadpole",
        json={
            "stack_id": stacks[0]["stack_id"],
            "compensatory_flux_quanta": 2,
            "green_schwarz_boost": 1.2,
        },
    )
    assert r_cancel.status_code == 200
    assert r_cancel.json()["chiral_anomaly_cancellation_pct"] >= 98.0

    r_metrics = client.get("/api/dbrane-tadpole/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["anomaly_cancellation_mechanism"] == "GREEN_SCHWARZ_TOPOLOGICAL_AXION"


# ---------------------------------------------------------------------------
# Capability 97: Chrono-Topological Novikov Self-Consistency Normalizer
# ---------------------------------------------------------------------------
def test_novikov_geodesic_normalizer_service():
    norm = get_novikov_geodesic_normalizer()
    loops = norm.list_loops()
    assert len(loops) >= 3
    l = loops[0]
    assert "loop_id" in l
    assert "unnormalized_paradox_probability" in l

    res = norm.normalize_geodesic_loop(
        loop_id=l["loop_id"],
        phase_adjustment_gain=1.5,
    )
    assert res["normalization_id"].startswith("NOVIKOV-NORM-")
    assert res["normalized_paradox_probability"] == 0.0  # Strict Novikov
    assert res["self_consistent_trajectory_locked"] is True
    assert res["path_integral_unitarity_pct"] == 100.0
    assert res["attosecond_topological_phase_slip_fs"] < 0.0001
    assert res["status"] == "NOVIKOV_SELF_CONSISTENT_LOOP_LOCKED"

    metrics = norm.get_normalizer_metrics()
    assert metrics["monitored_temporal_loops"] >= 3
    assert metrics["completed_loop_normalizations"] >= 1
    assert metrics["novikov_conjecture_compliance_pct"] == 100.0
    assert metrics["paradox_rate_achieved"] == 0.0


def test_novikov_geodesic_api_routes():
    r_loops = client.get("/api/novikov-geodesic/loops")
    assert r_loops.status_code == 200
    loops = r_loops.json()
    assert len(loops) >= 3

    r_norm = client.post(
        "/api/novikov-geodesic/normalize-loop",
        json={
            "loop_id": loops[0]["loop_id"],
            "phase_adjustment_gain": 1.2,
        },
    )
    assert r_norm.status_code == 200
    assert r_norm.json()["normalized_paradox_probability"] == 0.0

    r_metrics = client.get("/api/novikov-geodesic/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["path_integral_formalism"] == "FEYNMAN_NOVIKOV_GLOBAL_ACTION_EXTREMIZATION"


# ---------------------------------------------------------------------------
# Option B: Sovereign Sub-Atmospheric MHD Plasma Stealth & Wave-Rider Shield
# ---------------------------------------------------------------------------
def test_mhd_plasma_stealth_service():
    mhd = get_mhd_plasma_stealth()
    platforms = mhd.list_aero_platforms()
    assert len(platforms) >= 4
    p = platforms[0]
    assert "platform_id" in p
    assert p["mach_number"] >= 6.0
    assert p["magnetic_field_tesla"] >= 2.5

    res = mhd.engage_plasma_stealth(
        platform_id=p["platform_id"],
        field_boost_tesla=0.4,
        plasma_freq_ghz=28.0,
    )
    assert res["engagement_id"].startswith("MHD-ENG-")
    assert res["rf_rcs_attenuation_db"] >= 45.0  # Radar blackout verified
    assert res["lorentz_bow_shock_damping_pct"] >= 98.0  # Shock suppression
    assert res["drag_reduction_pct"] >= 65.0  # Drag reduction verified
    assert res["sonic_boom_ground_footprint_db"] < 15.0  # Sonic boom eliminated
    assert res["radar_cross_section_m2"] < 0.0001
    assert res["status"] == "MHD_FULL_STEALTH_ACTIVE"

    metrics = mhd.get_stealth_metrics()
    assert metrics["total_platforms"] >= 4
    assert metrics["stealth_active_platforms"] >= 1
    assert metrics["broadband_radar_blackout_ready"] is True
    assert metrics["lorentz_bow_shock_deflection_active"] is True


def test_mhd_plasma_stealth_api_routes():
    r_plat = client.get("/api/mhd-plasma-stealth/platforms")
    assert r_plat.status_code == 200
    platforms = r_plat.json()
    assert len(platforms) >= 4

    r_engage = client.post(
        "/api/mhd-plasma-stealth/engage-stealth",
        json={
            "platform_id": platforms[0]["platform_id"],
            "field_boost_tesla": 0.5,
            "plasma_freq_ghz": 24.5,
        },
    )
    assert r_engage.status_code == 200
    res = r_engage.json()
    assert res["rf_rcs_attenuation_db"] >= 45.0
    assert res["lorentz_bow_shock_damping_pct"] >= 98.0

    r_metrics = client.get("/api/mhd-plasma-stealth/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["broadband_radar_blackout_ready"] is True
