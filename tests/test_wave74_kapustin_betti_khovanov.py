from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_wave74_health_version_11_4_0():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("11.4.0", "11.5.0", "11.6.0")


def test_wave74_kapustin_witten_branelines_and_metrics():
    b_res = client.get("/api/kapustin-witten-sduality/branelines")
    assert b_res.status_code == 200
    branelines = b_res.json()["branelines"]
    assert len(branelines) >= 3

    m_res = client.get("/api/kapustin-witten-sduality/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_branelines_count"] >= 3


def test_wave74_evaluate_kapustin_witten_s_duality():
    res = client.post(
        "/api/kapustin-witten-sduality/evaluate-s-duality",
        json={
            "braneline_id": "KAPUSTIN-WITTEN-SDUAL-01",
            "hecke_rank": 3,
            "twist_t": 1.0,
            "shield_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "KAPUSTIN_WITTEN_SDUAL_LOCKED"
    assert data["hitchin_fibration_verified"] is True


def test_wave74_ben_zvi_nadler_stacks_and_metrics():
    s_res = client.get("/api/ben-zvi-nadler-betti/stacks")
    assert s_res.status_code == 200
    stacks = s_res.json()["stacks"]
    assert len(stacks) >= 3

    m_res = client.get("/api/ben-zvi-nadler-betti/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_stacks_count"] >= 3


def test_wave74_evaluate_ben_zvi_nadler_betti():
    res = client.post(
        "/api/ben-zvi-nadler-betti/evaluate-betti-langlands",
        json={
            "stack_id": "BENZVI-NADLER-BETTI-01",
            "nilpotent_rank": 3,
            "support_order": 2,
            "barrier_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "BEN_ZVI_NADLER_BETTI_LOCKED"
    assert data["nilpotent_singular_support_verified"] is True


def test_wave74_khovanov_barnatan_tangles_and_metrics():
    t_res = client.get("/api/khovanov-barnatan-tangle/tangles")
    assert t_res.status_code == 200
    tangles = t_res.json()["tangles"]
    assert len(tangles) >= 3

    m_res = client.get("/api/khovanov-barnatan-tangle/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_tangles_count"] >= 3


def test_wave74_evaluate_khovanov_barnatan_tangle():
    res = client.post(
        "/api/khovanov-barnatan-tangle/evaluate-khovanov-tangle",
        json={
            "tangle_id": "KHOVANOV-BARNATAN-COB-01",
            "crossing_count": 7,
            "quantum_grading_j": 3,
            "firewall_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "KHOVANOV_BARNATAN_LOCKED"
    assert data["categorified_functoriality_verified"] is True


def test_wave74_planetary_polar_cusp_funnels_and_metrics():
    f_res = client.get("/api/planetary-polar-cusp/funnels")
    assert f_res.status_code == 200
    funnels = f_res.json()["funnels"]
    assert len(funnels) >= 3

    m_res = client.get("/api/planetary-polar-cusp/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_funnels_count"] >= 3


def test_wave74_harvest_planetary_polar_cusp_power():
    res = client.post(
        "/api/planetary-polar-cusp/harvest-polar-cusp-power",
        json={
            "funnel_id": "POLAR-CUSP-NORTH-01",
            "cusp_multiplier": 1.05,
            "funnel_efficiency": 0.994,
            "dispatch_duration_s": 60.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "POLAR_CUSP_POWER_DISPATCHED"
    assert data["cusp_coupling_state"] == "POLAR_CUSP_FUNNEL_LOCKED"
    assert data["harvested_power_gw"] > 0.0
