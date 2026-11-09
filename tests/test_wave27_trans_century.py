"""
Unit and Integration Tests for Wave 27: Trans-Century Cosmological Geometry & Interstellar Propulsion.
Covers:
- Capability 101: Topological Torsion Teleparallel Gravity Engine
- Capability 102: Spin-Foam Quantum Geometry Area-Spectra Quantizer
- Capability 103: Non-Commutative Moyal-Weyl Spacetime Phase Space Protector
- Option B Wave 27: Sovereign Planetary Antimatter-Catalyzed Fusion (ACF) Interstellar Rocket
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.teleparallel_gravity.teleparallel_gravity import get_teleparallel_gravity_engine
from app.services.spin_foam_quantizer.spin_foam_quantizer import get_spin_foam_geometry_quantizer
from app.services.noncommutative_spacetime.noncommutative_spacetime import get_noncommutative_spacetime_protector
from app.services.antimatter_catalyzed_fusion.antimatter_catalyzed_fusion import (
    get_antimatter_catalyzed_fusion_rocket,
)


@pytest.fixture
def client():
    return TestClient(app)


# ==============================================================================
# Capability 101: Teleparallel Gravity Tests
# ==============================================================================

def test_teleparallel_gravity_service():
    engine = get_teleparallel_gravity_engine()
    nodes = engine.get_tetrad_nodes()
    assert len(nodes) >= 3
    node_id = nodes[0]["node_id"]

    res = engine.modulate_torsion(
        node_id=node_id,
        boost_factor=1.2,
        torsion_flux_gain=1.1,
    )
    assert res["node_id"] == node_id
    assert res["riemann_curvature_residual"] == 0.0
    assert res["inertia_decoupling_pct"] > 99.9
    assert res["status"] == "TELEPARALLEL_TORSION_STABILIZED"
    assert res["weitzenbock_affine_torsion_active"] is True

    metrics = engine.get_teleparallel_metrics()
    assert metrics["active_tetrad_count"] >= 3
    assert metrics["riemann_curvature_strict_zero"] is True


def test_teleparallel_gravity_api(client):
    nodes_res = client.get("/api/teleparallel-gravity/nodes")
    assert nodes_res.status_code == 200
    nodes = nodes_res.json()["nodes"]
    assert len(nodes) >= 3

    mod_res = client.post(
        "/api/teleparallel-gravity/modulate-torsion",
        json={
            "node_id": "TETRAD-NODE-WEITZENBOCK-01",
            "boost_factor": 1.15,
            "torsion_flux_gain": 1.08,
        },
    )
    assert mod_res.status_code == 200
    data = mod_res.json()
    assert data["node_id"] == "TETRAD-NODE-WEITZENBOCK-01"
    assert data["status"] == "TELEPARALLEL_TORSION_STABILIZED"

    metrics_res = client.get("/api/teleparallel-gravity/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["riemann_curvature_strict_zero"] is True


# ==============================================================================
# Capability 102: Spin-Foam Quantizer Tests
# ==============================================================================

def test_spin_foam_quantizer_service():
    quantizer = get_spin_foam_geometry_quantizer()
    simplices = quantizer.get_simplices()
    assert len(simplices) >= 3
    simplex_id = simplices[0]["simplex_id"]

    res = quantizer.quantize_area_spectra(
        simplex_id=simplex_id,
        spin_j=1.5,
        immirzi_gamma=0.2375,
        amplitude_gain=1.1,
    )
    assert res["simplex_id"] == simplex_id
    assert res["area_eigenvalue_m2"] > 0.0
    assert res["vertex_amplitude_coherence_pct"] > 99.9
    assert res["quantum_geometry_discreteness_enforced"] is True
    assert res["status"] == "SPIN_FOAM_AREA_QUANTIZED"

    metrics = quantizer.get_spin_foam_metrics()
    assert metrics["active_complexes_count"] >= 3
    assert metrics["discrete_spectrum_verified"] is True


def test_spin_foam_quantizer_api(client):
    sim_res = client.get("/api/spin-foam/simplices")
    assert sim_res.status_code == 200
    simplices = sim_res.json()["simplices"]
    assert len(simplices) >= 3

    quant_res = client.post(
        "/api/spin-foam/quantize-area",
        json={
            "simplex_id": "SPIN-SIMPLEX-EPRL-01",
            "spin_j": 2.0,
            "immirzi_gamma": 0.2375,
            "amplitude_gain": 1.05,
        },
    )
    assert quant_res.status_code == 200
    data = quant_res.json()
    assert data["simplex_id"] == "SPIN-SIMPLEX-EPRL-01"
    assert data["status"] == "SPIN_FOAM_AREA_QUANTIZED"

    metrics_res = client.get("/api/spin-foam/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["discrete_spectrum_verified"] is True


# ==============================================================================
# Capability 103: Non-Commutative Spacetime Tests
# ==============================================================================

def test_noncommutative_spacetime_service():
    protector = get_noncommutative_spacetime_protector()
    manifolds = protector.get_manifolds()
    assert len(manifolds) >= 3
    manifold_id = manifolds[0]["manifold_id"]

    res = protector.protect_phase_space(
        manifold_id=manifold_id,
        theta_adjustment_factor=1.2,
        star_product_order=4,
        damping_gain=1.15,
    )
    assert res["manifold_id"] == manifold_id
    assert res["uv_ir_mixing_decoupled"] is True
    assert res["heisenberg_coordinate_uncertainty_enforced"] is True
    assert res["uv_ir_mixing_damping_db"] > 100.0
    assert res["status"] == "PHASE_SPACE_NONCOMMUTATIVE_SECURED"

    metrics = protector.get_noncommutative_metrics()
    assert metrics["active_manifolds_count"] >= 3
    assert metrics["uv_ir_instability_quenched"] is True


def test_noncommutative_spacetime_api(client):
    man_res = client.get("/api/noncommutative-spacetime/manifolds")
    assert man_res.status_code == 200
    manifolds = man_res.json()["manifolds"]
    assert len(manifolds) >= 3

    prot_res = client.post(
        "/api/noncommutative-spacetime/protect-phase-space",
        json={
            "manifold_id": "MOYAL-MANIFOLD-PLANCK-01",
            "theta_adjustment_factor": 1.1,
            "star_product_order": 4,
            "damping_gain": 1.2,
        },
    )
    assert prot_res.status_code == 200
    data = prot_res.json()
    assert data["manifold_id"] == "MOYAL-MANIFOLD-PLANCK-01"
    assert data["status"] == "PHASE_SPACE_NONCOMMUTATIVE_SECURED"

    metrics_res = client.get("/api/noncommutative-spacetime/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["uv_ir_instability_quenched"] is True


# ==============================================================================
# Option B Wave 27: Antimatter-Catalyzed Fusion Rocket Tests
# ==============================================================================

def test_antimatter_fusion_service():
    rocket = get_antimatter_catalyzed_fusion_rocket()
    thrusters = rocket.get_thrusters()
    assert len(thrusters) >= 3
    thruster_id = thrusters[0]["thruster_id"]

    res = rocket.ignite_pulse(
        thruster_id=thruster_id,
        antiprotons_pg=0.5,
        pellet_compression_gain=1.15,
        rep_rate_hz=30.0,
    )
    assert res["thruster_id"] == thruster_id
    assert res["specific_impulse_isp_s"] > 350000.0
    assert res["exhaust_velocity_km_s"] > 3400.0
    assert res["continuous_thrust_kn"] > 0.0
    assert res["trans_solar_relativistic_capability"] is True
    assert res["status"] == "ACF_THRUSTER_FIRING_OPTIMAL"

    metrics = rocket.get_antimatter_fusion_metrics()
    assert metrics["active_thruster_count"] >= 3
    assert metrics["trans_solar_intercept_readiness"] is True


def test_antimatter_fusion_api(client):
    thrust_res = client.get("/api/antimatter-fusion/thrusters")
    assert thrust_res.status_code == 200
    thrusters = thrust_res.json()["thrusters"]
    assert len(thrusters) >= 3

    ignite_res = client.post(
        "/api/antimatter-fusion/ignite-pulse",
        json={
            "thruster_id": "ACF-THRUSTER-VALKYRIE-01",
            "antiprotons_pg": 0.6,
            "pellet_compression_gain": 1.2,
            "rep_rate_hz=35.0": 35.0,  # test defaults or request body
            "rep_rate_hz": 35.0,
        },
    )
    assert ignite_res.status_code == 200
    data = ignite_res.json()
    assert data["thruster_id"] == "ACF-THRUSTER-VALKYRIE-01"
    assert data["status"] == "ACF_THRUSTER_FIRING_OPTIMAL"

    metrics_res = client.get("/api/antimatter-fusion/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["trans_solar_intercept_readiness"] is True

