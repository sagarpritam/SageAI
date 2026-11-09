"""
Unit and Integration Tests for Wave 28: Higher-Dimensional String Field Theory & Monopole Catalysis.
Covers:
- Capability 104: Open-Closed String Field Theory Vertex Integrator
- Capability 105: Calabi-Yau Mirror Symmetry Hodge Diamond Inverter
- Capability 106: Fibonacci Anyon Braid Compiler & Topological Fault-Tolerance Synthesizer
- Option B Wave 28: Sovereign Planetary Magnetic Monopole Proton Decay Battery
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.string_field_theory.string_field_theory import get_string_field_theory_integrator
from app.services.mirror_symmetry.mirror_symmetry import get_calabi_yau_mirror_symmetry_inverter
from app.services.fibonacci_anyon_compiler.fibonacci_anyon_compiler import get_fibonacci_anyon_compiler
from app.services.monopole_catalysis_battery.monopole_catalysis_battery import (
    get_magnetic_monopole_catalyzed_battery,
)


@pytest.fixture
def client():
    return TestClient(app)


# ==============================================================================
# Capability 104: String Field Theory Tests
# ==============================================================================

def test_string_field_theory_service():
    integrator = get_string_field_theory_integrator()
    vertices = integrator.get_vertices()
    assert len(vertices) >= 3
    vertex_id = vertices[0]["vertex_id"]

    res = integrator.condense_tachyon(
        vertex_id=vertex_id,
        coupling_g0=0.45,
        truncation_level=8,
        damping_gain=1.1,
    )
    assert res["vertex_id"] == vertex_id
    assert res["tachyonic_mode_condensed"] is True
    assert res["sens_conjecture_verified"] is True
    assert res["achieved_vacuum_depth_pct"] > 99.0
    assert res["brane_tension_annihilation_pct"] > 99.0
    assert res["status"] == "SFT_TACHYON_VACUUM_CONDENSED"

    metrics = integrator.get_sft_metrics()
    assert metrics["active_sft_vertices"] >= 3
    assert metrics["brst_cohomology_preserved"] is True


def test_string_field_theory_api(client):
    vert_res = client.get("/api/string-field-theory/vertices")
    assert vert_res.status_code == 200
    vertices = vert_res.json()["vertices"]
    assert len(vertices) >= 3

    cond_res = client.post(
        "/api/string-field-theory/condense-tachyon",
        json={
            "vertex_id": "SFT-VERTEX-WITTEN-01",
            "coupling_g0": 0.5,
            "truncation_level": 8,
            "damping_gain": 1.15,
        },
    )
    assert cond_res.status_code == 200
    data = cond_res.json()
    assert data["vertex_id"] == "SFT-VERTEX-WITTEN-01"
    assert data["status"] == "SFT_TACHYON_VACUUM_CONDENSED"

    metrics_res = client.get("/api/string-field-theory/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["brst_cohomology_preserved"] is True


# ==============================================================================
# Capability 105: Calabi-Yau Mirror Symmetry Tests
# ==============================================================================

def test_mirror_symmetry_service():
    inverter = get_calabi_yau_mirror_symmetry_inverter()
    manifolds = inverter.get_manifolds()
    assert len(manifolds) >= 3
    manifold_id = manifolds[0]["manifold_id"]

    res = inverter.invert_hodge_diamond(
        manifold_id=manifold_id,
        complex_modulus_z=0.05,
        instanton_degree_max=5,
        duality_coupling_gain=1.1,
    )
    assert res["manifold_id"] == manifold_id
    assert res["hodge_diamond_flipped"] is True
    assert res["h_1_1_inverted_mirror"] == manifolds[0]["h_2_1_original"]
    assert res["h_2_1_inverted_mirror"] == manifolds[0]["h_1_1_original"]
    assert res["homological_mirror_symmetry_verified"] is True
    assert res["status"] == "HODGE_DIAMOND_INVERTED_COHERENT"

    metrics = inverter.get_mirror_metrics()
    assert metrics["active_mirror_pairs"] >= 3
    assert metrics["picard_fuchs_monodromy_locked"] is True


def test_mirror_symmetry_api(client):
    man_res = client.get("/api/mirror-symmetry/manifolds")
    assert man_res.status_code == 200
    manifolds = man_res.json()["manifolds"]
    assert len(manifolds) >= 3

    inv_res = client.post(
        "/api/mirror-symmetry/invert-hodge",
        json={
            "manifold_id": "CY-MIRROR-FERMAT-QUINTIC-01",
            "complex_modulus_z": 0.04,
            "instanton_degree_max": 4,
            "duality_coupling_gain": 1.05,
        },
    )
    assert inv_res.status_code == 200
    data = inv_res.json()
    assert data["manifold_id"] == "CY-MIRROR-FERMAT-QUINTIC-01"
    assert data["status"] == "HODGE_DIAMOND_INVERTED_COHERENT"

    metrics_res = client.get("/api/mirror-symmetry/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["picard_fuchs_monodromy_locked"] is True


# ==============================================================================
# Capability 106: Fibonacci Anyon Compiler Tests
# ==============================================================================

def test_fibonacci_anyon_service():
    compiler = get_fibonacci_anyon_compiler()
    braids = compiler.get_braids()
    assert len(braids) >= 3
    braid_id = braids[0]["braid_id"]

    res = compiler.compile_braid(
        braid_id=braid_id,
        target_gate="HADAMARD",
        braid_length_steps=32,
        damping_gain=1.15,
    )
    assert res["braid_id"] == braid_id
    assert res["target_gate"] == "HADAMARD"
    assert res["topological_gate_fidelity_pct"] > 99.99
    assert res["topological_decoherence_suppression_db"] > 125.0
    assert res["pentagon_hexagon_consistency_verified"] is True
    assert res["universal_topological_quantum_logic_locked"] is True
    assert res["status"] == "FIBONACCI_BRAID_COMPILED"

    metrics = compiler.get_fibonacci_metrics()
    assert metrics["active_braid_channels"] >= 3
    assert metrics["universal_braiding_complete"] is True


def test_fibonacci_anyon_api(client):
    braid_res = client.get("/api/fibonacci-anyon/braids")
    assert braid_res.status_code == 200
    braids = braid_res.json()["braids"]
    assert len(braids) >= 3

    comp_res = client.post(
        "/api/fibonacci-anyon/compile-braid",
        json={
            "braid_id": "FIB-BRAID-TOPOLOGICAL-01",
            "target_gate": "CNOT",
            "braid_length_steps": 48,
            "damping_gain": 1.2,
        },
    )
    assert comp_res.status_code == 200
    data = comp_res.json()
    assert data["braid_id"] == "FIB-BRAID-TOPOLOGICAL-01"
    assert data["target_gate"] == "CNOT"
    assert data["status"] == "FIBONACCI_BRAID_COMPILED"

    metrics_res = client.get("/api/fibonacci-anyon/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["universal_braiding_complete"] is True


# ==============================================================================
# Option B Wave 28: Magnetic Monopole Proton Decay Battery Tests
# ==============================================================================

def test_monopole_battery_service():
    battery = get_magnetic_monopole_catalyzed_battery()
    traps = battery.get_traps()
    assert len(traps) >= 3
    trap_id = traps[0]["trap_id"]

    res = battery.catalyze_proton_decay(
        trap_id=trap_id,
        proton_feed_ug_s=1.2,
        confinement_boost=1.05,
        load_demand_gw=100.0,
    )
    assert res["trap_id"] == trap_id
    assert res["mass_to_energy_conversion_pct"] == 100.0
    assert res["gross_thermal_power_gw"] > 100.0
    assert res["net_electrical_baseload_gw"] > 90.0
    assert res["zero_long_lived_nuclear_waste"] is True
    assert res["status"] == "MONOPOLE_CATALYSIS_ACTIVE_OPTIMAL"

    metrics = battery.get_monopole_metrics()
    assert metrics["active_monopole_traps"] >= 3
    assert metrics["zero_carbon_zero_actinide_waste"] is True


def test_monopole_battery_api(client):
    trap_res = client.get("/api/monopole-battery/traps")
    assert trap_res.status_code == 200
    traps = trap_res.json()["traps"]
    assert len(traps) >= 3

    cat_res = client.post(
        "/api/monopole-battery/catalyze-decay",
        json={
            "trap_id": "MONOPOLE-TRAP-ICELAND-01",
            "proton_feed_ug_s": 1.3,
            "confinement_boost": 1.1,
            "load_demand_gw": 110.0,
        },
    )
    assert cat_res.status_code == 200
    data = cat_res.json()
    assert data["trap_id"] == "MONOPOLE-TRAP-ICELAND-01"
    assert data["mass_to_energy_conversion_pct"] == 100.0
    assert data["status"] == "MONOPOLE_CATALYSIS_ACTIVE_OPTIMAL"

    metrics_res = client.get("/api/monopole-battery/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_carbon_zero_actinide_waste"] is True

