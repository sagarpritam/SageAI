"""Wave 34 Pytest Suite: Complexity Holography, Carrollian Shield, Modular Bootstrap & Casimir-Sagnac Grid."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_complexity_holography_endpoints():
    res = client.get("/api/complexity-holography/bounds")
    assert res.status_code == 200
    bounds = res.json()["bounds"]
    assert len(bounds) == 3

    audit_res = client.post(
        "/api/complexity-holography/audit-complexity",
        json={
            "bound_id": "CMP-WDW-ACTION-01",
            "central_charge": 240.0,
            "lloyd_ratio": 0.96,
            "switchback_shocks": 6,
            "wdw_anchor_gain": 1.6,
        },
    )
    assert audit_res.status_code == 200
    body = audit_res.json()
    assert body["status"] == "COMPLEXITY_WDW_SEALED"
    assert body["lloyd_bound_satisfied"] is True
    assert body["chaos_suppression_db"] > 157.0
    assert body["complexity_fidelity_pct"] > 99.997

    metrics_res = client.get("/api/complexity-holography/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["active_complexity_bounds"] == 3


def test_carrollian_holography_endpoints():
    res = client.get("/api/carrollian-holography/manifolds")
    assert res.status_code == 200
    manifolds = res.json()["manifolds"]
    assert len(manifolds) == 3

    seal_res = client.post(
        "/api/carrollian-holography/seal-carrollian",
        json={
            "manifold_id": "CAR-NULL-SCRI-01",
            "carroll_coupling": 0.95,
            "dipole_charge": 6.0,
            "null_clamp_gain": 1.65,
        },
    )
    assert seal_res.status_code == 200
    body = seal_res.json()
    assert body["status"] == "CARROLLIAN_NULL_SEALED"
    assert body["fracton_dipole_locked"] is True
    assert body["cone_isolation_db"] > 158.0
    assert body["boundary_coherence_pct"] > 99.997

    metrics_res = client.get("/api/carrollian-holography/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["ultralocal_fracton_lock"] is True


def test_modular_bootstrap_endpoints():
    res = client.get("/api/modular-bootstrap/genera")
    assert res.status_code == 200
    genera = res.json()["genera"]
    assert len(genera) == 3

    audit_res = client.post(
        "/api/modular-bootstrap/audit-modular",
        json={
            "genus_id": "MOD-SL2Z-TORUS-01",
            "central_charge": 48.0,
            "spin_cutoff": 24,
            "functional_depth": 1.7,
        },
    )
    assert audit_res.status_code == 200
    body = audit_res.json()
    assert body["status"] == "MODULAR_BOOTSTRAP_SEALED"
    assert body["rademacher_convergent"] is True
    assert body["hellerman_gap_bound"] > 4.0
    assert body["ghost_suppression_db"] > 159.0

    metrics_res = client.get("/api/modular-bootstrap/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["sl2z_s_duality_locked"] is True


def test_casimir_sagnac_power_endpoints():
    res = client.get("/api/casimir-sagnac-power/arrays")
    assert res.status_code == 200
    arrays = res.json()["arrays"]
    assert len(arrays) == 3

    harvest_res = client.post(
        "/api/casimir-sagnac-power/harvest-sagnac",
        json={
            "array_id": "CAS-SAGNAC-ORBIT-01",
            "pump_frequency_mhz": 520.0,
            "squeeze_gain": 1.65,
        },
    )
    assert harvest_res.status_code == 200
    body = harvest_res.json()
    assert body["status"] == "CASIMIR_SAGNAC_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 220.0

    metrics_res = client.get("/api/casimir-sagnac-power/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fissile_waste"] is True


def test_wave34_404_error_handling():
    assert (
        client.post(
            "/api/complexity-holography/audit-complexity",
            json={"bound_id": "INVALID-BOUND"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/carrollian-holography/seal-carrollian",
            json={"manifold_id": "INVALID-MANIFOLD"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/modular-bootstrap/audit-modular",
            json={"genus_id": "INVALID-GENUS"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/casimir-sagnac-power/harvest-sagnac",
            json={"array_id": "INVALID-ARRAY"},
        ).status_code
        == 404
    )
