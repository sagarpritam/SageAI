"""
Unit & Integration Tests for Wave 26: Asymptotic Safety Flow Stabilizer, Horava-Lifshitz Scaling Governor,
Centesimal Quantum Gravity Singularity-Free Synthesizer & Magneto-Inertial Fusion (Capabilities 98-100 + Option B).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.asymptotic_safety_stabilizer import get_asymptotic_safety_stabilizer
from app.services.horava_lifshitz_governor import get_horava_lifshitz_governor
from app.services.centesimal_quantum_gravity import get_centesimal_quantum_gravity_synthesizer
from app.services.magneto_inertial_fusion import get_magneto_inertial_fusion

client = TestClient(app)


# ---------------------------------------------------------------------------
# Capability 98: Asymptotically Safe Renormalization Group Flow Stabilizer
# ---------------------------------------------------------------------------
def test_asymptotic_safety_service():
    stabilizer = get_asymptotic_safety_stabilizer()
    nodes = stabilizer.list_nodes()
    assert len(nodes) >= 3
    node = nodes[0]
    assert "node_id" in node
    assert "cutoff_scale_k_gev" in node
    assert "dimensionless_newton_g" in node

    res = stabilizer.stabilize_rg_flow(
        node_id=node["node_id"],
        flow_momentum_k_gev=1.22e19,
        regulator_shape_parameter=1.2,
    )
    assert res["stabilization_id"].startswith("AS-FLOW-")
    assert res["post_flow_divergence_measure"] == 0.0
    assert res["uv_fixed_point_reach_pct"] >= 99.8
    assert res["anomalous_graviton_dimension_eta"] < 0.0
    assert res["status"] == "ASYMPTOTIC_SAFETY_FIXED_POINT_LOCKED"

    metrics = stabilizer.get_stabilizer_metrics()
    assert metrics["monitored_rg_nodes"] >= 3
    assert metrics["completed_flow_stabilizations"] >= 1
    assert metrics["status"] == "OPERATIONAL"


def test_asymptotic_safety_api():
    r_nodes = client.get("/api/asymptotic-safety/nodes")
    assert r_nodes.status_code == 200
    nodes = r_nodes.json()
    assert len(nodes) >= 3

    r_stab = client.post(
        "/api/asymptotic-safety/stabilize-flow",
        json={
            "node_id": nodes[0]["node_id"],
            "flow_momentum_k_gev": 1.2e19,
            "regulator_shape_parameter": 1.1,
        },
    )
    assert r_stab.status_code == 200
    res = r_stab.json()
    assert res["post_flow_divergence_measure"] == 0.0

    r_metrics = client.get("/api/asymptotic-safety/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["functional_flow_equation"] == "WETTERICH_MORRIS_EXACT_FRG"


# ---------------------------------------------------------------------------
# Capability 99: Horava-Lifshitz Anisotropic Lifshitz Scaling Governor
# ---------------------------------------------------------------------------
def test_horava_lifshitz_service():
    governor = get_horava_lifshitz_governor()
    domains = governor.list_domains()
    assert len(domains) >= 3
    domain = domains[0]
    assert "domain_id" in domain
    assert "dynamical_critical_exponent_z" in domain

    res = governor.govern_lifshitz_scaling(
        domain_id=domain["domain_id"],
        target_exponent_z=3.0,
        foliation_damping_gain=1.2,
    )
    assert res["scaling_id"].startswith("HL-SCALE-")
    assert res["governed_z"] == 3.0
    assert res["foliation_invariance_pct"] >= 99.9
    assert res["ghost_free_mode_count"] >= 40
    assert res["high_derivative_suppression_db"] > 100.0
    assert res["status"] == "HORAVA_LIFSHITZ_SCALING_GOVERNED"

    metrics = governor.get_governor_metrics()
    assert metrics["monitored_horava_domains"] >= 3
    assert metrics["completed_scaling_adjustments"] >= 1
    assert metrics["ghost_free_unitarity"] is True


def test_horava_lifshitz_api():
    r_domains = client.get("/api/horava-lifshitz/domains")
    assert r_domains.status_code == 200
    domains = r_domains.json()
    assert len(domains) >= 3

    r_scale = client.post(
        "/api/horava-lifshitz/govern-scaling",
        json={
            "domain_id": domains[0]["domain_id"],
            "target_exponent_z": 3.0,
            "foliation_damping_gain": 1.1,
        },
    )
    assert r_scale.status_code == 200
    assert r_scale.json()["governed_z"] == 3.0

    r_metrics = client.get("/api/horava-lifshitz/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["uv_critical_exponent"] == "Z_EQUALS_3_LIFSHITZ_POWER_COUNTING"


# ---------------------------------------------------------------------------
# Capability 100: Centesimal Quantum Gravity Singularity-Free Metric Synthesizer
# ---------------------------------------------------------------------------
def test_centesimal_quantum_gravity_service():
    synthesizer = get_centesimal_quantum_gravity_synthesizer()
    fabrics = synthesizer.list_fabrics()
    assert len(fabrics) >= 3
    f = fabrics[0]
    assert "fabric_id" in f
    assert f["singularity_eliminated"] is True

    res = synthesizer.synthesize_singularity_free_metric(
        fabric_id=f["fabric_id"],
        bounce_damping_factor=1.2,
        area_gap_gain=1.05,
    )
    assert res["synthesis_id"].startswith("CQG-CENTURY-")
    assert res["divergence_eliminated"] is True
    assert res["timelike_geodesic_closure_pct"] == 100.0
    assert res["null_geodesic_closure_pct"] == 100.0
    assert res["quantum_bounce_radius_meters"] > 0.0
    assert res["century_milestone_certified"] is True
    assert res["status"] == "CENTESIMAL_SINGULARITY_FREE_METRIC_LOCKED"

    metrics = synthesizer.get_centesimal_metrics()
    assert metrics["century_capability_milestone"] == 100
    assert metrics["global_kretschmann_bounded"] is True
    assert metrics["singularity_free_guarantee"] is True


def test_centesimal_quantum_gravity_api():
    r_fabrics = client.get("/api/centesimal-quantum-gravity/fabrics")
    assert r_fabrics.status_code == 200
    fabrics = r_fabrics.json()
    assert len(fabrics) >= 3

    r_synth = client.post(
        "/api/centesimal-quantum-gravity/synthesize-metric",
        json={
            "fabric_id": fabrics[0]["fabric_id"],
            "bounce_damping_factor": 1.1,
            "area_gap_gain": 1.0,
        },
    )
    assert r_synth.status_code == 200
    assert r_synth.json()["century_milestone_certified"] is True

    r_metrics = client.get("/api/centesimal-quantum-gravity/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["century_capability_milestone"] == 100


# ---------------------------------------------------------------------------
# Option B: Sovereign Directed Magneto-Inertial Fusion (MIF) Matrix
# ---------------------------------------------------------------------------
def test_magneto_inertial_fusion_service():
    mif = get_magneto_inertial_fusion()
    reactors = mif.list_reactors()
    assert len(reactors) >= 3
    r = reactors[0]
    assert "reactor_id" in r
    assert r["thermonuclear_q_factor"] >= 10.0
    assert r["thermal_power_output_gw"] >= 2.5

    res = mif.pulse_fusion_reactor(
        reactor_id=r["reactor_id"],
        current_boost_ma=2.5,
        compression_gain=1.2,
    )
    assert res["pulse_id"].startswith("MIF-PULSE-")
    assert res["fusion_gain_q"] >= 10.0
    assert res["thermal_yield_gw"] >= 2.5
    assert res["direct_electrical_conversion_mw"] >= 800.0
    assert res["specific_impulse_isp_s"] >= 120000.0
    assert res["dew_array_power_bus_charged"] is True
    assert res["status"] == "MIF_THERMONUCLEAR_PULSE_SUCCESS"

    metrics = mif.get_fusion_metrics()
    assert metrics["operational_reactors"] >= 3
    assert metrics["completed_fusion_pulses"] >= 1
    assert metrics["status"] == "OPERATIONAL"


def test_magneto_inertial_fusion_api():
    r_reactors = client.get("/api/magneto-inertial-fusion/reactors")
    assert r_reactors.status_code == 200
    reactors = r_reactors.json()
    assert len(reactors) >= 3

    r_pulse = client.post(
        "/api/magneto-inertial-fusion/pulse-fusion",
        json={
            "reactor_id": reactors[0]["reactor_id"],
            "current_boost_ma": 2.0,
            "compression_gain": 1.1,
        },
    )
    assert r_pulse.status_code == 200
    res = r_pulse.json()
    assert res["fusion_gain_q"] >= 10.0
    assert res["dew_array_power_bus_charged"] is True

    r_metrics = client.get("/api/magneto-inertial-fusion/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["confinement_scheme"] == "CYLINDRICAL_METALLIC_LINER_MAGNETO_INERTIAL"

