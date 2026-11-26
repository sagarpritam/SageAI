from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_wave72_health_version_11_2_0():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("11.2.0", "11.3.0", "11.4.0", "11.5.0")


def test_wave72_maulik_okounkov_cohomologies_and_metrics():
    c_res = client.get("/api/maulik-okounkov-qc/cohomologies")
    assert c_res.status_code == 200
    cohomologies = c_res.json()["cohomologies"]
    assert len(cohomologies) >= 3

    m_res = client.get("/api/maulik-okounkov-qc/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_cohomologies_count"] >= 3


def test_wave72_evaluate_maulik_okounkov_qc():
    res = client.post(
        "/api/maulik-okounkov-qc/evaluate-quantum-cohomology",
        json={
            "cohomology_id": "MAULIK-OKOUNKOV-QC-01",
            "torus_rank": 4,
            "quantum_degree": 3,
            "shield_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "MO_QUANTUM_COHOMOLOGY_LOCKED"
    assert data["baxter_q_operator_verified"] is True


def test_wave72_bridgeland_manifolds_and_metrics():
    m_res = client.get("/api/bridgeland-stability/manifolds")
    assert m_res.status_code == 200
    manifolds = m_res.json()["manifolds"]
    assert len(manifolds) >= 3

    met_res = client.get("/api/bridgeland-stability/metrics")
    assert met_res.status_code == 200
    assert met_res.json()["active_manifolds_count"] >= 3


def test_wave72_evaluate_bridgeland_stability():
    res = client.post(
        "/api/bridgeland-stability/evaluate-bridgeland-stability",
        json={
            "manifold_id": "BRIDGELAND-STAB-K3-01",
            "heart_shift": 1,
            "filtration_length": 3,
            "barrier_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "BRIDGELAND_STABILITY_LOCKED"
    assert data["support_property_verified"] is True


def test_wave72_getzler_kapranov_operads_and_metrics():
    o_res = client.get("/api/getzler-kapranov-operad/operads")
    assert o_res.status_code == 200
    operads = o_res.json()["operads"]
    assert len(operads) >= 3

    m_res = client.get("/api/getzler-kapranov-operad/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_operads_count"] >= 3


def test_wave72_evaluate_getzler_kapranov_operad():
    res = client.post(
        "/api/getzler-kapranov-operad/evaluate-operad-bv",
        json={
            "operad_id": "GETZLER-KAPRANOV-MODULAR-01",
            "genus_order": 2,
            "arity_n": 4,
            "firewall_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "GETZLER_KAPRANOV_BV_LOCKED"
    assert data["feynman_transform_verified"] is True


def test_wave72_planetary_magnetotail_lobes_and_metrics():
    l_res = client.get("/api/planetary-magnetotail/lobes")
    assert l_res.status_code == 200
    lobes = l_res.json()["lobes"]
    assert len(lobes) >= 3

    m_res = client.get("/api/planetary-magnetotail/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_lobes_count"] >= 3


def test_wave72_harvest_planetary_magnetotail_power():
    res = client.post(
        "/api/planetary-magnetotail/harvest-magnetotail-power",
        json={
            "lobe_id": "MAGNETOTAIL-XLINE-01",
            "plasmoid_multiplier": 1.05,
            "reconnection_efficiency": 0.992,
            "dispatch_duration_s": 60.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "MAGNETOTAIL_POWER_DISPATCHED"
    assert data["plasmoid_coupling_state"] == "MAGNETOTAIL_PLASMOID_LOCKED"
    assert data["harvested_power_gw"] > 0.0
