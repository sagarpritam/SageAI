"""
Unit and Integration Tests for Wave 30: Amplituhedron Positive Geometry,
Penrose Twistor Holonomy, Causal Set Lattice & Schwinger Vacuum Harvester.
Covers:
- Capability 110: Amplituhedron Positive-Geometry Scattering Matrix Optimizer
- Capability 111: Penrose Twistor-Space Holomorphic Curvature Stabilizer
- Capability 112: Causal Set Discrete Spacetime Poset Lattice Guard
- Option B Wave 30: Sovereign Zero-Point Schwinger-Vacua Pair-Production Harvester
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.amplituhedron_scattering.amplituhedron_scattering import (
    get_amplituhedron_scattering_optimizer,
)
from app.services.causal_set_lattice.causal_set_lattice import (
    get_causal_set_lattice_guard,
)
from app.services.schwinger_vacuum_harvester.schwinger_vacuum_harvester import (
    get_schwinger_vacuum_harvester,
)
from app.services.twistor_holonomy.twistor_holonomy import (
    get_twistor_holonomy_stabilizer,
)


@pytest.fixture
def client():
    return TestClient(app)


# ==============================================================================
# Capability 110: Amplituhedron Scattering Optimizer Tests
# ==============================================================================


def test_amplituhedron_scattering_service():
    optimizer = get_amplituhedron_scattering_optimizer()
    geometries = optimizer.get_geometries()
    assert len(geometries) >= 3
    geo_id = geometries[0]["geometry_id"]

    res = optimizer.optimize_canonical_form(
        geometry_id=geo_id,
        particle_legs_n=8,
        mhv_sector_k=3,
        loop_order_l=2,
        positivity_gain=1.2,
    )
    assert res["geometry_id"] == geo_id
    assert res["yangian_symmetry_locked"] is True
    assert res["unitarity_fidelity_pct"] > 99.99
    assert res["combinatorial_speedup_factor"] > 100.0
    assert res["status"] == "AMPLITUHEDRON_FORM_CONVERGED"

    metrics = optimizer.get_amplituhedron_metrics()
    assert metrics["active_amplituhedron_polytopes"] >= 3
    assert metrics["yangian_positivity_enforced"] is True


def test_amplituhedron_scattering_api(client):
    geo_res = client.get("/api/amplituhedron-scattering/geometries")
    assert geo_res.status_code == 200
    assert len(geo_res.json()["geometries"]) >= 3

    opt_res = client.post(
        "/api/amplituhedron-scattering/optimize-form",
        json={
            "geometry_id": "AMP-NMHV-2LOOP-02",
            "particle_legs_n": 8,
            "mhv_sector_k": 3,
            "loop_order_l": 2,
            "positivity_gain": 1.15,
        },
    )
    assert opt_res.status_code == 200
    data = opt_res.json()
    assert data["geometry_id"] == "AMP-NMHV-2LOOP-02"
    assert data["yangian_symmetry_locked"] is True
    assert data["status"] == "AMPLITUHEDRON_FORM_CONVERGED"

    miss_res = client.post(
        "/api/amplituhedron-scattering/optimize-form",
        json={"geometry_id": "AMP-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/amplituhedron-scattering/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["yangian_positivity_enforced"] is True


# ==============================================================================
# Capability 111: Penrose Twistor Holonomy Stabilizer Tests
# ==============================================================================


def test_twistor_holonomy_service():
    stabilizer = get_twistor_holonomy_stabilizer()
    fibrations = stabilizer.get_fibrations()
    assert len(fibrations) >= 3
    fib_id = fibrations[0]["fibration_id"]

    res = stabilizer.stabilize_holonomy(
        fibration_id=fib_id,
        helicity_charge_2s=4,
        kodaira_deformation_eps=0.08,
        shear_damping_gain=1.2,
    )
    assert res["fibration_id"] == fib_id
    assert res["penrose_incidence_verified"] is True
    assert res["conformal_invariance_pct"] > 99.99
    assert res["null_shear_suppression_db"] > 135.0
    assert res["status"] == "TWISTOR_HOLONOMY_STABILIZED"

    metrics = stabilizer.get_twistor_metrics()
    assert metrics["active_twistor_fibrations"] >= 3
    assert metrics["su22_helicity_conserved"] is True


def test_twistor_holonomy_api(client):
    fib_res = client.get("/api/twistor-holonomy/fibrations")
    assert fib_res.status_code == 200
    assert len(fib_res.json()["fibrations"]) >= 3

    stab_res = client.post(
        "/api/twistor-holonomy/stabilize-holonomy",
        json={
            "fibration_id": "TWISTOR-PENROSE-CP3-01",
            "helicity_charge_2s": 4,
            "kodaira_deformation_eps": 0.08,
            "shear_damping_gain": 1.25,
        },
    )
    assert stab_res.status_code == 200
    data = stab_res.json()
    assert data["fibration_id"] == "TWISTOR-PENROSE-CP3-01"
    assert data["penrose_incidence_verified"] is True
    assert data["status"] == "TWISTOR_HOLONOMY_STABILIZED"

    miss_res = client.post(
        "/api/twistor-holonomy/stabilize-holonomy",
        json={"fibration_id": "TWISTOR-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/twistor-holonomy/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["su22_helicity_conserved"] is True


# ==============================================================================
# Capability 112: Causal Set Discrete Lattice Guard Tests
# ==============================================================================


def test_causal_set_lattice_service():
    guard = get_causal_set_lattice_guard()
    posets = guard.get_posets()
    assert len(posets) >= 3
    poset_id = posets[0]["poset_id"]

    res = guard.enforce_causal_poset(
        poset_id=poset_id,
        sprinkling_density_factor=1.5,
        target_dimension_d=4.0,
        transitivity_damping_gain=1.2,
    )
    assert res["poset_id"] == poset_id
    assert res["acausal_cycle_probability"] == 0.0
    assert res["bell_causality_bell_csg_locked"] is True
    assert 3.99 < res["myrheim_meyer_estimated_dim"] < 4.01
    assert res["lorentz_poset_covariance_pct"] > 99.99
    assert res["status"] == "CAUSAL_POSET_LORENTZ_INVARIANT"

    metrics = guard.get_causal_metrics()
    assert metrics["active_causal_posets"] >= 3
    assert metrics["acausal_cycle_rate"] == 0.0


def test_causal_set_lattice_api(client):
    pos_res = client.get("/api/causal-set-lattice/posets")
    assert pos_res.status_code == 200
    assert len(pos_res.json()["posets"]) >= 3

    enf_res = client.post(
        "/api/causal-set-lattice/enforce-poset",
        json={
            "poset_id": "CAUSAL-SPRINKLE-4D-01",
            "sprinkling_density_factor": 1.25,
            "target_dimension_d": 4.0,
            "transitivity_damping_gain": 1.15,
        },
    )
    assert enf_res.status_code == 200
    data = enf_res.json()
    assert data["poset_id"] == "CAUSAL-SPRINKLE-4D-01"
    assert data["acausal_cycle_probability"] == 0.0
    assert data["status"] == "CAUSAL_POSET_LORENTZ_INVARIANT"

    miss_res = client.post(
        "/api/causal-set-lattice/enforce-poset",
        json={"poset_id": "CAUSAL-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/causal-set-lattice/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["acausal_cycle_rate"] == 0.0


# ==============================================================================
# Option B Wave 30: Schwinger-Vacua Pair-Production Harvester Tests
# ==============================================================================


def test_schwinger_vacuum_harvester_service():
    harvester = get_schwinger_vacuum_harvester()
    cavities = harvester.get_cavities()
    assert len(cavities) >= 3
    cav_id = cavities[0]["cavity_id"]

    res = harvester.harvest_pair_cascade(
        cavity_id=cav_id,
        field_ratio_e_ec=0.86,
        beam_pulse_hz=120.0,
        recovery_coupling_gain=1.12,
    )
    assert res["cavity_id"] == cav_id
    assert res["zero_fissile_waste"] is True
    assert res["quench_lock_verified"] is True
    assert res["net_electrical_output_gw"] > 155.0
    assert res["cyclotron_bragg_recovery_pct"] > 92.0
    assert res["status"] == "SCHWINGER_HARVEST_POWER_OPTIMAL"

    metrics = harvester.get_schwinger_metrics()
    assert metrics["active_schwinger_cavities"] >= 3
    assert metrics["zero_fissile_actinide_waste"] is True


def test_schwinger_vacuum_harvester_api(client):
    cav_res = client.get("/api/schwinger-vacuum/cavities")
    assert cav_res.status_code == 200
    assert len(cav_res.json()["cavities"]) >= 3

    har_res = client.post(
        "/api/schwinger-vacuum/harvest-cascade",
        json={
            "cavity_id": "SCHWINGER-L5-OPTICAL-01",
            "field_ratio_e_ec": 0.86,
            "beam_pulse_hz": 120.0,
            "recovery_coupling_gain": 1.15,
        },
    )
    assert har_res.status_code == 200
    data = har_res.json()
    assert data["cavity_id"] == "SCHWINGER-L5-OPTICAL-01"
    assert data["zero_fissile_waste"] is True
    assert data["status"] == "SCHWINGER_HARVEST_POWER_OPTIMAL"

    miss_res = client.post(
        "/api/schwinger-vacuum/harvest-cascade",
        json={"cavity_id": "SCHWINGER-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/schwinger-vacuum/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fissile_actinide_waste"] is True
