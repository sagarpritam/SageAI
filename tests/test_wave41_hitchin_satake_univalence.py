"""
Wave 41 Tests: Hitchin Moduli & Hyperkahler Firewall (Cap 143),
Geometric Satake & Kashiwara Crystal Shield (Cap 144),
HoTT Voevodsky Univalence & Infinity-Groupoid Firewall (Cap 145),
and Option B Wave 41: Planetary Magic-Angle Twisted-Trilayer Andreev Supergrid.
"""

from fastapi.testclient import TestClient

from app.main import app
from app.services.geometric_satake_kashiwara import get_geometric_satake_shield
from app.services.hitchin_moduli_hyperkahler import get_hitchin_moduli_firewall
from app.services.homotopy_type_univalence import get_homotopy_univalence_firewall
from app.services.twisted_bilayer_supergrid import get_twisted_trilayer_supergrid

client = TestClient(app)


def test_hitchin_moduli_hyperkahler_endpoints():
    res = client.get("/api/hitchin-moduli-hyperkahler/bundles")
    assert res.status_code == 200
    bundles = res.json()["bundles"]
    assert len(bundles) == 3

    seal = client.post(
        "/api/hitchin-moduli-hyperkahler/seal-hitchin",
        json={
            "bundle_id": bundles[0]["bundle_id"],
            "riemann_genus": 3,
            "spectral_network_nodes": 12,
            "twistor_rotation_deg": 18,
            "hyperkahler_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "HITCHIN_MODULI_SEALED"
    assert body["gmn_wall_crossing_locked"] is True
    assert body["hitchin_unitarity_pct"] > 99.99

    metrics = client.get("/api/hitchin-moduli-hyperkahler/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_hitchin_bundles"] == 3


def test_geometric_satake_kashiwara_endpoints():
    res = client.get("/api/geometric-satake-kashiwara/sheaves")
    assert res.status_code == 200
    sheaves = res.json()["sheaves"]
    assert len(sheaves) == 3

    seal = client.post(
        "/api/geometric-satake-kashiwara/seal-crystal",
        json={
            "sheaf_id": sheaves[0]["sheaf_id"],
            "dual_group_rank": 4,
            "crystal_operator_depth": 14,
            "mv_polytope_vertices": 12,
            "satake_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "SATAKE_CRYSTAL_SEALED"
    assert body["lusztig_canonical_basis_locked"] is True
    assert body["satake_unitarity_pct"] > 99.99

    metrics = client.get("/api/geometric-satake-kashiwara/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_satake_sheaves"] == 3


def test_homotopy_type_univalence_endpoints():
    res = client.get("/api/homotopy-type-univalence/universes")
    assert res.status_code == 200
    universes = res.json()["universes"]
    assert len(universes) == 3

    seal = client.post(
        "/api/homotopy-type-univalence/seal-univalence",
        json={
            "universe_id": universes[0]["universe_id"],
            "h_truncation_level": 2,
            "cubical_dimension": 8,
            "hit_constructors": 10,
            "univalence_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "HOTT_UNIVALENCE_SEALED"
    assert body["eckmann_hilton_coherence_locked"] is True
    assert body["univalence_fidelity_pct"] > 99.99

    metrics = client.get("/api/homotopy-type-univalence/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_univalent_universes"] == 3


def test_twisted_bilayer_supergrid_endpoints():
    res = client.get("/api/twisted-bilayer-supergrid/arrays")
    assert res.status_code == 200
    arrays = res.json()["arrays"]
    assert len(arrays) == 3

    harvest = client.post(
        "/api/twisted-bilayer-supergrid/harvest-andreev",
        json={
            "array_id": arrays[0]["array_id"],
            "twist_angle_millideg": 1560.0,
            "quantum_metric_gain": 1.6,
        },
    )
    assert harvest.status_code == 200
    body = harvest.json()
    assert body["status"] == "ANDREEV_SUPERGRID_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 300.0

    metrics = client.get("/api/twisted-bilayer-supergrid/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_andreev_arrays"] == 3


def test_wave41_404_error_handling():
    assert (
        client.post(
            "/api/hitchin-moduli-hyperkahler/seal-hitchin",
            json={"bundle_id": "UNKNOWN-BUNDLE"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/geometric-satake-kashiwara/seal-crystal",
            json={"sheaf_id": "UNKNOWN-SHEAF"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/homotopy-type-univalence/seal-univalence",
            json={"universe_id": "UNKNOWN-UNIVERSE"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/twisted-bilayer-supergrid/harvest-andreev",
            json={"array_id": "UNKNOWN-ARRAY"},
        ).status_code
        == 404
    )


def test_wave41_service_singletons():
    assert get_hitchin_moduli_firewall() is get_hitchin_moduli_firewall()
    assert get_geometric_satake_shield() is get_geometric_satake_shield()
    assert get_homotopy_univalence_firewall() is get_homotopy_univalence_firewall()
    assert get_twisted_trilayer_supergrid() is get_twisted_trilayer_supergrid()
