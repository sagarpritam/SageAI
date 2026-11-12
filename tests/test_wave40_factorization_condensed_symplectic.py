"""Wave 40 Pytest Suite: Factorization Homology, Condensed Mathematics, Derived Shifted-Symplectic & Quantum Thermoelectric Ratchet Grid."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.condensed_liquid_mathematics import get_condensed_liquid_shield
from app.services.derived_shifted_symplectic import (
    get_derived_shifted_symplectic_shield,
)
from app.services.factorization_homology_tft import get_factorization_homology_firewall
from app.services.quantum_thermoelectric_ratchet import (
    get_quantum_thermoelectric_ratchet_grid,
)

client = TestClient(app)


def test_factorization_homology_endpoints():
    res = client.get("/api/factorization-homology-tft/manifolds")
    assert res.status_code == 200
    assert len(res.json()["manifolds"]) == 3

    seal_res = client.post(
        "/api/factorization-homology-tft/seal-manifold",
        json={
            "manifold_id": "FACTORIZATION-E3-S3-01",
            "operad_dimension": 3,
            "excision_strata_depth": 12,
            "koszul_duality_order": 6,
            "excision_gain": 1.6,
        },
    )
    assert seal_res.status_code == 200
    body = seal_res.json()
    assert body["status"] == "FACTORIZATION_MANIFOLD_SEALED"
    assert body["koszul_self_duality_locked"] is True
    assert body["operadic_suppression_db"] > 162.0
    assert body["factorization_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/factorization-homology-tft/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["active_factorization_manifolds"] == 3


def test_condensed_liquid_mathematics_endpoints():
    res = client.get("/api/condensed-liquid-mathematics/modules")
    assert res.status_code == 200
    assert len(res.json()["modules"]) == 3

    seal_res = client.post(
        "/api/condensed-liquid-mathematics/seal-condensed",
        json={
            "module_id": "LIQUID-SCHOLZE-P05-01",
            "liquid_exponent_p": 0.5,
            "profinite_stone_rank": 16,
            "ext_vanishing_degree": 6,
            "condensed_gain": 1.6,
        },
    )
    assert seal_res.status_code == 200
    body = seal_res.json()
    assert body["status"] == "CONDENSED_LIQUID_SEALED"
    assert body["scholze_liquid_acyclic_locked"] is True
    assert body["condensed_suppression_db"] > 162.0
    assert body["condensed_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/condensed-liquid-mathematics/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["scholze_liquid_acyclic_locked"] is True


def test_derived_shifted_symplectic_endpoints():
    res = client.get("/api/derived-shifted-symplectic/stacks")
    assert res.status_code == 200
    assert len(res.json()["stacks"]) == 3

    seal_res = client.post(
        "/api/derived-shifted-symplectic/seal-lagrangian",
        json={
            "stack_id": "PTVV-AKSZ-CY3-01",
            "symplectic_shift_n": -1,
            "lagrangian_intersection_rank": 10,
            "aksz_transgression_degree": 6,
            "symplectic_gain": 1.6,
        },
    )
    assert seal_res.status_code == 200
    body = seal_res.json()
    assert body["status"] == "DERIVED_LAGRANGIAN_SEALED"
    assert body["aksz_transgression_sealed"] is True
    assert body["lagrangian_isolation_db"] > 163.0
    assert body["derived_symplectic_fidelity_pct"] > 99.997

    metrics_res = client.get("/api/derived-shifted-symplectic/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["aksz_transgression_sealed"] is True


def test_quantum_thermoelectric_power_endpoints():
    res = client.get("/api/quantum-thermoelectric-power/harvesters")
    assert res.status_code == 200
    assert len(res.json()["harvesters"]) == 3

    harvest_res = client.post(
        "/api/quantum-thermoelectric-power/harvest-ratchet",
        json={
            "harvester_id": "NONHERM-SKIN-ARRAY-01",
            "bath_gradient_kelvin": 420.0,
            "nonhermitian_gain": 1.6,
        },
    )
    assert harvest_res.status_code == 200
    body = harvest_res.json()
    assert body["status"] == "THERMOELECTRIC_RATCHET_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 300.0

    metrics_res = client.get("/api/quantum-thermoelectric-power/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fissile_waste"] is True


def test_wave40_not_found_errors():
    r1 = client.post(
        "/api/factorization-homology-tft/seal-manifold",
        json={"manifold_id": "NONEXISTENT-MANIFOLD"},
    )
    assert r1.status_code == 404

    r2 = client.post(
        "/api/condensed-liquid-mathematics/seal-condensed",
        json={"module_id": "NONEXISTENT-MODULE"},
    )
    assert r2.status_code == 404

    r3 = client.post(
        "/api/derived-shifted-symplectic/seal-lagrangian",
        json={"stack_id": "NONEXISTENT-STACK"},
    )
    assert r3.status_code == 404

    r4 = client.post(
        "/api/quantum-thermoelectric-power/harvest-ratchet",
        json={"harvester_id": "NONEXISTENT-HARVESTER"},
    )
    assert r4.status_code == 404


def test_wave40_service_singletons():
    fw = get_factorization_homology_firewall()
    cond = get_condensed_liquid_shield()
    symp = get_derived_shifted_symplectic_shield()
    grid = get_quantum_thermoelectric_ratchet_grid()

    assert len(fw.get_manifolds()) == 3
    assert len(cond.get_modules()) == 3
    assert len(symp.get_stacks()) == 3
    assert len(grid.get_harvesters()) == 3
