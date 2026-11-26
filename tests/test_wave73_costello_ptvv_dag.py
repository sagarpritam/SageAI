from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_wave73_health_version_11_3_0():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("11.3.0", "11.4.0", "11.5.0", "11.6.0")


def test_wave73_costello_bv_theories_and_metrics():
    t_res = client.get("/api/costello-bv-renorm/theories")
    assert t_res.status_code == 200
    theories = t_res.json()["theories"]
    assert len(theories) >= 3

    m_res = client.get("/api/costello-bv-renorm/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_theories_count"] >= 3


def test_wave73_evaluate_costello_bv_renorm():
    res = client.post(
        "/api/costello-bv-renorm/evaluate-bv-renorm",
        json={
            "theory_id": "COSTELLO-BV-RENORM-01",
            "loop_order": 2,
            "scale_cutoff": 0.01,
            "shield_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "COSTELLO_BV_RENORM_LOCKED"
    assert data["rg_flow_counterterm_verified"] is True


def test_wave73_ptvv_stacks_and_metrics():
    s_res = client.get("/api/ptvv-shifted-symplectic/stacks")
    assert s_res.status_code == 200
    stacks = s_res.json()["stacks"]
    assert len(stacks) >= 3

    m_res = client.get("/api/ptvv-shifted-symplectic/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_stacks_count"] >= 3


def test_wave73_evaluate_ptvv_shifted_symplectic():
    res = client.post(
        "/api/ptvv-shifted-symplectic/evaluate-shifted-symplectic",
        json={
            "stack_id": "PTVV-SHIFTED-SYMPLECTIC-01",
            "symplectic_shift_n": -1,
            "lagrangian_rank": 3,
            "barrier_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "PTVV_SHIFTED_SYMPLECTIC_LOCKED"
    assert data["derived_lagrangian_verified"] is True


def test_wave73_gaitsgory_rozenblyum_crystals_and_metrics():
    c_res = client.get("/api/gaitsgory-rozenblyum-dag/crystals")
    assert c_res.status_code == 200
    crystals = c_res.json()["crystals"]
    assert len(crystals) >= 3

    m_res = client.get("/api/gaitsgory-rozenblyum-dag/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_crystals_count"] >= 3


def test_wave73_evaluate_gaitsgory_rozenblyum_dag():
    res = client.post(
        "/api/gaitsgory-rozenblyum-dag/evaluate-indcoherent-crystal",
        json={
            "crystal_id": "GAITSGORY-ROZENBLYUM-INDCOH-01",
            "serre_order": 3,
            "algebroid_rank": 4,
            "firewall_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "GAITSGORY_ROZENBLYUM_DAG_LOCKED"
    assert data["grothendieck_serre_verified"] is True


def test_wave73_planetary_magnetopause_vortices_and_metrics():
    v_res = client.get("/api/planetary-magnetopause/vortices")
    assert v_res.status_code == 200
    vortices = v_res.json()["vortices"]
    assert len(vortices) >= 3

    m_res = client.get("/api/planetary-magnetopause/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_vortices_count"] >= 3


def test_wave73_harvest_planetary_magnetopause_power():
    res = client.post(
        "/api/planetary-magnetopause/harvest-magnetopause-power",
        json={
            "vortex_id": "MAGNETOPAUSE-KH-DAWN-01",
            "vortex_multiplier": 1.05,
            "kh_efficiency": 0.993,
            "dispatch_duration_s": 60.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "MAGNETOPAUSE_POWER_DISPATCHED"
    assert data["kh_coupling_state"] == "MAGNETOPAUSE_KH_LOCKED"
    assert data["harvested_power_gw"] > 0.0
