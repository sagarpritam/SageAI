"""
Wave 43 Tests: Cluster Algebra & Stasheff Associahedron Firewall (Cap 149),
Quantum Affine Algebra & Yangian R-Matrix Spectral Shield (Cap 150),
Lurie (infinity,n)-Category Bordism Hypothesis Firewall (Cap 151),
and Option B Wave 43: Planetary Altermagnetic Spin-Split & Magnonic Supergrid.
"""

from fastapi.testclient import TestClient

from app.main import app
from app.services.altermagnetic_magnon_supergrid import (
    get_altermagnetic_magnon_supergrid,
)
from app.services.cluster_algebra_associahedron import get_cluster_algebra_firewall
from app.services.infinity_topos_lurie_cobordism import (
    get_infinity_cobordism_firewall,
)
from app.services.kashiwara_quantum_affine_yangian import (
    get_quantum_affine_yangian_shield,
)

client = TestClient(app)


def test_cluster_algebra_associahedron_endpoints():
    res = client.get("/api/cluster-algebra-associahedron/clusters")
    assert res.status_code == 200
    clusters = res.json()["clusters"]
    assert len(clusters) == 3

    seal = client.post(
        "/api/cluster-algebra-associahedron/seal-cluster",
        json={
            "cluster_id": clusters[0]["cluster_id"],
            "cluster_rank": 4,
            "stasheff_vertices": 14,
            "quiver_mutation_depth": 12,
            "cluster_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "CLUSTER_ASSOCIAHEDRON_SEALED"
    assert body["laurent_phenomenon_locked"] is True
    assert body["quiver_unitarity_pct"] > 99.99

    metrics = client.get("/api/cluster-algebra-associahedron/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_cluster_polytopes"] == 3


def test_kashiwara_quantum_affine_yangian_endpoints():
    res = client.get("/api/kashiwara-quantum-affine-yangian/yangians")
    assert res.status_code == 200
    yangians = res.json()["yangians"]
    assert len(yangians) == 3

    seal = client.post(
        "/api/kashiwara-quantum-affine-yangian/seal-yangian",
        json={
            "yangian_id": yangians[0]["yangian_id"],
            "yangian_rank": 4,
            "bethe_roots_count": 16,
            "baxter_q_depth": 12,
            "yangian_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "QUANTUM_YANGIAN_SEALED"
    assert body["rtt_relation_locked"] is True
    assert body["bethe_unitarity_pct"] > 99.99

    metrics = client.get("/api/kashiwara-quantum-affine-yangian/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_yangian_algebras"] == 3


def test_infinity_topos_lurie_cobordism_endpoints():
    res = client.get("/api/infinity-topos-lurie-cobordism/cobordisms")
    assert res.status_code == 200
    cobordisms = res.json()["cobordisms"]
    assert len(cobordisms) == 3

    seal = client.post(
        "/api/infinity-topos-lurie-cobordism/seal-cobordism",
        json={
            "cobordism_id": cobordisms[0]["cobordism_id"],
            "category_dimension_n": 3,
            "dualizable_cells": 18,
            "stratified_seams": 14,
            "cobordism_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "INFINITY_COBORDISM_SEALED"
    assert body["full_dualizability_locked"] is True
    assert body["infinity_unitarity_pct"] > 99.99

    metrics = client.get("/api/infinity-topos-lurie-cobordism/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_cobordism_functors"] == 3


def test_altermagnetic_magnon_supergrid_endpoints():
    res = client.get("/api/altermagnetic-magnon-supergrid/arrays")
    assert res.status_code == 200
    arrays = res.json()["arrays"]
    assert len(arrays) == 3

    harvest = client.post(
        "/api/altermagnetic-magnon-supergrid/harvest-altermagnet",
        json={
            "array_id": arrays[0]["array_id"],
            "spin_splitting_mev": 480.0,
            "magnon_coherence_gain": 1.6,
        },
    )
    assert harvest.status_code == 200
    body = harvest.json()
    assert body["status"] == "ALTERMAGNETIC_SUPERGRID_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 300.0

    metrics = client.get("/api/altermagnetic-magnon-supergrid/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_altermagnetic_arrays"] == 3


def test_wave43_404_error_handling():
    assert (
        client.post(
            "/api/cluster-algebra-associahedron/seal-cluster",
            json={"cluster_id": "UNKNOWN-CLUSTER"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/kashiwara-quantum-affine-yangian/seal-yangian",
            json={"yangian_id": "UNKNOWN-YANGIAN"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/infinity-topos-lurie-cobordism/seal-cobordism",
            json={"cobordism_id": "UNKNOWN-COBORDISM"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/altermagnetic-magnon-supergrid/harvest-altermagnet",
            json={"array_id": "UNKNOWN-ARRAY"},
        ).status_code
        == 404
    )


def test_wave43_service_singletons():
    assert get_cluster_algebra_firewall() is get_cluster_algebra_firewall()
    assert get_quantum_affine_yangian_shield() is get_quantum_affine_yangian_shield()
    assert get_infinity_cobordism_firewall() is get_infinity_cobordism_firewall()
    assert get_altermagnetic_magnon_supergrid() is get_altermagnetic_magnon_supergrid()
