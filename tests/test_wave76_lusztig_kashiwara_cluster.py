from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_wave76_health_version_11_6_0():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("11.6.0")


def test_wave76_lusztig_bases_and_metrics():
    b_res = client.get("/api/lusztig-canonical-basis/bases")
    assert b_res.status_code == 200
    bases = b_res.json()["bases"]
    assert len(bases) >= 3

    m_res = client.get("/api/lusztig-canonical-basis/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_bases_count"] >= 3


def test_wave76_evaluate_lusztig_canonical_basis():
    res = client.post(
        "/api/lusztig-canonical-basis/evaluate-canonical-basis",
        json={
            "basis_id": "LUSZTIG-CANONICAL-UQG-01",
            "crystal_rank": 4,
            "bar_order": 2,
            "shield_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "LUSZTIG_CANONICAL_LOCKED"
    assert data["bar_involution_verified"] is True


def test_wave76_kashiwara_crystals_and_metrics():
    c_res = client.get("/api/kashiwara-crystal-graph/crystals")
    assert c_res.status_code == 200
    crystals = c_res.json()["crystals"]
    assert len(crystals) >= 3

    m_res = client.get("/api/kashiwara-crystal-graph/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_crystals_count"] >= 3


def test_wave76_evaluate_kashiwara_crystal_graph():
    res = client.post(
        "/api/kashiwara-crystal-graph/evaluate-crystal-graph",
        json={
            "crystal_id": "KASHIWARA-CRYSTAL-B-01",
            "operator_rank": 6,
            "string_cone_dim": 4,
            "barrier_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "KASHIWARA_CRYSTAL_LOCKED"
    assert data["littelmann_path_verified"] is True


def test_wave76_fomin_zelevinsky_clusters_and_metrics():
    c_res = client.get("/api/fomin-zelevinsky-cluster/clusters")
    assert c_res.status_code == 200
    clusters = c_res.json()["clusters"]
    assert len(clusters) >= 3

    m_res = client.get("/api/fomin-zelevinsky-cluster/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_clusters_count"] >= 3


def test_wave76_evaluate_fomin_zelevinsky_cluster():
    res = client.post(
        "/api/fomin-zelevinsky-cluster/evaluate-cluster-mutation",
        json={
            "cluster_id": "FOMIN-ZELEVINSKY-CLUSTER-01",
            "seed_rank": 5,
            "mutation_depth": 4,
            "firewall_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "FOMIN_ZELEVINSKY_CLUSTER_LOCKED"
    assert data["laurent_positivity_verified"] is True


def test_wave76_planetary_electrojet_and_metrics():
    e_res = client.get("/api/planetary-electrojet/electrojets")
    assert e_res.status_code == 200
    electrojets = e_res.json()["electrojets"]
    assert len(electrojets) >= 3

    m_res = client.get("/api/planetary-electrojet/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_electrojets_count"] >= 3


def test_wave76_harvest_planetary_electrojet_power():
    res = client.post(
        "/api/planetary-electrojet/harvest-electrojet-power",
        json={
            "electrojet_id": "ELECTROJET-WESTWARD-01",
            "substorm_multiplier": 1.05,
            "induction_efficiency": 0.996,
            "dispatch_duration_s": 60.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ELECTROJET_POWER_DISPATCHED"
    assert data["electrojet_coupling_state"] == "ELECTROJET_SUBSTORM_LOCKED"
    assert data["harvested_power_gw"] > 0.0
