"""
Wave 45 Tests: Donaldson-Thomas Coherent Sheaf Moduli Shield (Cap 155),
Floer-Novikov Homology Gradient Firewall (Cap 156),
Beilinson-Drinfeld Chiral Grassmannian Shield (Cap 157),
and Option B Wave 45: Planetary Non-Abelian Majorana Zero-Mode Supergrid.
"""

from fastapi.testclient import TestClient

from app.main import app
from app.services.beilinson_drinfeld_chiral import get_beilinson_drinfeld_chiral_shield
from app.services.donaldson_thomas_sheaf import get_donaldson_thomas_sheaf_shield
from app.services.floer_novikov_gradient import get_floer_novikov_firewall
from app.services.majorana_zero_supergrid import get_majorana_zero_supergrid

client = TestClient(app)


def test_donaldson_thomas_sheaf_endpoints():
    res = client.get("/api/donaldson-thomas-sheaf/sheaves")
    assert res.status_code == 200
    sheaves = res.json()["sheaves"]
    assert len(sheaves) == 3

    seal = client.post(
        "/api/donaldson-thomas-sheaf/seal-dt",
        json={
            "sheaf_id": sheaves[0]["sheaf_id"],
            "sheaf_rank": 4,
            "chern_degree": 12,
            "stability_chamber_depth": 14,
            "dt_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "DONALDSON_THOMAS_SEALED"
    assert body["dt_sheaf_locked"] is True
    assert body["coherent_unitarity_pct"] > 99.99

    metrics = client.get("/api/donaldson-thomas-sheaf/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_dt_sheaves"] == 3


def test_floer_novikov_gradient_endpoints():
    res = client.get("/api/floer-novikov-gradient/critical-manifolds")
    assert res.status_code == 200
    manifolds = res.json()["critical_manifolds"]
    assert len(manifolds) == 3

    seal = client.post(
        "/api/floer-novikov-gradient/seal-novikov",
        json={
            "manifold_id": manifolds[0]["manifold_id"],
            "critical_point_rank": 4,
            "gradient_flow_lines": 12,
            "novikov_filtration_depth": 14,
            "novikov_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "FLOER_NOVIKOV_SEALED"
    assert body["floer_novikov_locked"] is True
    assert body["symplectic_unitarity_pct"] > 99.99

    metrics = client.get("/api/floer-novikov-gradient/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_novikov_manifolds"] == 3


def test_beilinson_drinfeld_chiral_endpoints():
    res = client.get("/api/beilinson-drinfeld-chiral/algebras")
    assert res.status_code == 200
    algebras = res.json()["algebras"]
    assert len(algebras) == 3

    seal = client.post(
        "/api/beilinson-drinfeld-chiral/seal-chiral",
        json={
            "algebra_id": algebras[0]["algebra_id"],
            "algebra_level_k": 4,
            "curve_points_n": 12,
            "factorization_depth": 14,
            "chiral_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "BEILINSON_DRINFELD_SEALED"
    assert body["chiral_homology_locked"] is True
    assert body["conformal_unitarity_pct"] > 99.99

    metrics = client.get("/api/beilinson-drinfeld-chiral/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_chiral_algebras"] == 3


def test_majorana_zero_supergrid_endpoints():
    res = client.get("/api/majorana-zero-supergrid/arrays")
    assert res.status_code == 200
    arrays = res.json()["arrays"]
    assert len(arrays) == 3

    harvest = client.post(
        "/api/majorana-zero-supergrid/harvest-majorana",
        json={
            "array_id": arrays[0]["array_id"],
            "braiding_depth": 24,
            "topological_protection_gain": 1.6,
        },
    )
    assert harvest.status_code == 200
    body = harvest.json()
    assert body["status"] == "MAJORANA_SUPERGRID_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 300.0

    metrics = client.get("/api/majorana-zero-supergrid/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_majorana_arrays"] == 3


def test_wave45_404_error_handling():
    assert (
        client.post(
            "/api/donaldson-thomas-sheaf/seal-dt",
            json={"sheaf_id": "UNKNOWN-SHEAF"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/floer-novikov-gradient/seal-novikov",
            json={"manifold_id": "UNKNOWN-MANIFOLD"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/beilinson-drinfeld-chiral/seal-chiral",
            json={"algebra_id": "UNKNOWN-ALGEBRA"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/majorana-zero-supergrid/harvest-majorana",
            json={"array_id": "UNKNOWN-ARRAY"},
        ).status_code
        == 404
    )


def test_wave45_service_singletons():
    assert get_donaldson_thomas_sheaf_shield() is get_donaldson_thomas_sheaf_shield()
    assert get_floer_novikov_firewall() is get_floer_novikov_firewall()
    assert (
        get_beilinson_drinfeld_chiral_shield() is get_beilinson_drinfeld_chiral_shield()
    )
    assert get_majorana_zero_supergrid() is get_majorana_zero_supergrid()
