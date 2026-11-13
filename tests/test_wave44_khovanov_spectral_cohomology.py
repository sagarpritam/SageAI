"""
Wave 44 Tests: Khovanov Homology & Foam Cobordism Shield (Cap 152),
Derived Algebraic Geometry & Spectral Scheme Firewall (Cap 153),
Quantum Cohomology & Gromov-Witten Invariant Shield (Cap 154),
and Option B Wave 44: Planetary Chiral Topological Semimetal & Weyl-Fermion Supergrid.
"""

from fastapi.testclient import TestClient

from app.main import app
from app.services.derived_spectral_scheme import get_derived_spectral_scheme_firewall
from app.services.khovanov_foam_cobordism import get_khovanov_foam_shield
from app.services.quantum_gromov_witten import get_quantum_gromov_witten_shield
from app.services.weyl_chiral_supergrid import get_weyl_chiral_supergrid

client = TestClient(app)


def test_khovanov_foam_cobordism_endpoints():
    res = client.get("/api/khovanov-foam-cobordism/knots")
    assert res.status_code == 200
    knots = res.json()["knots"]
    assert len(knots) == 3

    seal = client.post(
        "/api/khovanov-foam-cobordism/seal-khovanov",
        json={
            "knot_id": knots[0]["knot_id"],
            "knot_rank": 4,
            "crossing_depth": 12,
            "foam_facets": 14,
            "khovanov_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "KHOVANOV_FOAM_SEALED"
    assert body["khovanov_homology_locked"] is True
    assert body["categorified_unitarity_pct"] > 99.99

    metrics = client.get("/api/khovanov-foam-cobordism/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_khovanov_complexes"] == 3


def test_derived_spectral_scheme_endpoints():
    res = client.get("/api/derived-spectral-scheme/schemes")
    assert res.status_code == 200
    schemes = res.json()["schemes"]
    assert len(schemes) == 3

    seal = client.post(
        "/api/derived-spectral-scheme/seal-scheme",
        json={
            "scheme_id": schemes[0]["scheme_id"],
            "spectral_rank": 4,
            "cotangent_truncation": 12,
            "etale_sheaf_strata": 14,
            "scheme_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "DERIVED_SCHEME_SEALED"
    assert body["derived_etale_locked"] is True
    assert body["spectral_unitarity_pct"] > 99.99

    metrics = client.get("/api/derived-spectral-scheme/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_spectral_schemes"] == 3


def test_quantum_gromov_witten_endpoints():
    res = client.get("/api/quantum-gromov-witten/invariants")
    assert res.status_code == 200
    invariants = res.json()["invariants"]
    assert len(invariants) == 3

    seal = client.post(
        "/api/quantum-gromov-witten/seal-gromov",
        json={
            "invariant_id": invariants[0]["invariant_id"],
            "curve_genus": 0,
            "marked_points": 14,
            "novikov_degree": 12,
            "quantum_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "GROMOV_WITTEN_SEALED"
    assert body["wdvv_associativity_locked"] is True
    assert body["quantum_unitarity_pct"] > 99.99

    metrics = client.get("/api/quantum-gromov-witten/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_gromov_invariants"] == 3


def test_weyl_chiral_supergrid_endpoints():
    res = client.get("/api/weyl-chiral-supergrid/arrays")
    assert res.status_code == 200
    arrays = res.json()["arrays"]
    assert len(arrays) == 3

    harvest = client.post(
        "/api/weyl-chiral-supergrid/harvest-weyl",
        json={
            "array_id": arrays[0]["array_id"],
            "fermi_arc_angstrom": 0.42,
            "chiral_anomaly_gain": 1.6,
        },
    )
    assert harvest.status_code == 200
    body = harvest.json()
    assert body["status"] == "WEYL_SUPERGRID_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 300.0

    metrics = client.get("/api/weyl-chiral-supergrid/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_weyl_arrays"] == 3


def test_wave44_404_error_handling():
    assert (
        client.post(
            "/api/khovanov-foam-cobordism/seal-khovanov",
            json={"knot_id": "UNKNOWN-KNOT"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/derived-spectral-scheme/seal-scheme",
            json={"scheme_id": "UNKNOWN-SCHEME"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/quantum-gromov-witten/seal-gromov",
            json={"invariant_id": "UNKNOWN-INVARIANT"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/weyl-chiral-supergrid/harvest-weyl",
            json={"array_id": "UNKNOWN-ARRAY"},
        ).status_code
        == 404
    )


def test_wave44_service_singletons():
    assert get_khovanov_foam_shield() is get_khovanov_foam_shield()
    assert (
        get_derived_spectral_scheme_firewall() is get_derived_spectral_scheme_firewall()
    )
    assert get_quantum_gromov_witten_shield() is get_quantum_gromov_witten_shield()
    assert get_weyl_chiral_supergrid() is get_weyl_chiral_supergrid()
