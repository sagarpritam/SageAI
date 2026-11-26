from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_wave75_health_version_11_5_0():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("11.5.0", "11.6.0", "11.7.0")


def test_wave75_webster_klr_algebras_and_metrics():
    a_res = client.get("/api/webster-klr-cat/algebras")
    assert a_res.status_code == 200
    algebras = a_res.json()["algebras"]
    assert len(algebras) >= 3

    m_res = client.get("/api/webster-klr-cat/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_algebras_count"] >= 3


def test_wave75_evaluate_webster_klr_tensor():
    res = client.post(
        "/api/webster-klr-cat/evaluate-klr-tensor",
        json={
            "algebra_id": "WEBSTER-KLR-TENSOR-01",
            "highest_weight_rank": 3,
            "strand_count": 6,
            "shield_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "WEBSTER_KLR_LOCKED"
    assert data["canonical_basis_verified"] is True


def test_wave75_elias_williamson_bimodules_and_metrics():
    b_res = client.get("/api/elias-williamson-soergel/bimodules")
    assert b_res.status_code == 200
    bimodules = b_res.json()["bimodules"]
    assert len(bimodules) >= 3

    m_res = client.get("/api/elias-williamson-soergel/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_bimodules_count"] >= 3


def test_wave75_evaluate_elias_williamson_soergel():
    res = client.post(
        "/api/elias-williamson-soergel/evaluate-soergel-hodge",
        json={
            "bimodule_id": "ELIAS-WILLIAMSON-SOERGEL-01",
            "hodge_rank": 3,
            "bott_samelson_length": 5,
            "barrier_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ELIAS_WILLIAMSON_SOERGEL_LOCKED"
    assert data["hard_lefschetz_verified"] is True


def test_wave75_chuang_rouquier_complexes_and_metrics():
    c_res = client.get("/api/chuang-rouquier-sl2/complexes")
    assert c_res.status_code == 200
    complexes = c_res.json()["complexes"]
    assert len(complexes) >= 3

    m_res = client.get("/api/chuang-rouquier-sl2/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_complexes_count"] >= 3


def test_wave75_evaluate_chuang_rouquier_sl2():
    res = client.post(
        "/api/chuang-rouquier-sl2/evaluate-rickard-complex",
        json={
            "complex_id": "CHUANG-ROUQUIER-SL2-01",
            "rickard_terms": 4,
            "perverse_shift_p": 2,
            "firewall_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "CHUANG_ROUQUIER_SL2_LOCKED"
    assert data["perverse_equivalence_verified"] is True


def test_wave75_planetary_akr_cavities_and_metrics():
    c_res = client.get("/api/planetary-akr-maser/cavities")
    assert c_res.status_code == 200
    cavities = c_res.json()["cavities"]
    assert len(cavities) >= 3

    m_res = client.get("/api/planetary-akr-maser/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_cavities_count"] >= 3


def test_wave75_harvest_planetary_akr_power():
    res = client.post(
        "/api/planetary-akr-maser/harvest-akr-power",
        json={
            "cavity_id": "AKR-CAVITY-BOREAL-01",
            "maser_multiplier": 1.05,
            "maser_efficiency": 0.995,
            "dispatch_duration_s": 60.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "AKR_MASER_POWER_DISPATCHED"
    assert data["akr_coupling_state"] == "AKR_MASER_LOCKED"
    assert data["harvested_power_gw"] > 0.0
