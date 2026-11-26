from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_wave71_health_version_11_1_0():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("11.1.0", "11.2.0", "11.3.0", "11.4.0", "11.5.0", "11.6.0")


def test_wave71_nakajima_quivers_and_metrics():
    q_res = client.get("/api/nakajima-quiver-yangian/quivers")
    assert q_res.status_code == 200
    quivers = q_res.json()["quivers"]
    assert len(quivers) >= 3

    m_res = client.get("/api/nakajima-quiver-yangian/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_quivers_count"] >= 3


def test_wave71_evaluate_nakajima_quiver_yangian():
    res = client.post(
        "/api/nakajima-quiver-yangian/evaluate-quiver-yangian",
        json={
            "quiver_id": "NAKAJIMA-QUIVER-ADE-01",
            "framing_rank": 2,
            "equivariant_weight": 3,
            "shield_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "NAKAJIMA_QUIVER_LOCKED"
    assert data["stable_envelope_verified"] is True


def test_wave71_pandharipande_thomas_pairs_and_metrics():
    p_res = client.get("/api/pandharipande-thomas-bps/pairs")
    assert p_res.status_code == 200
    pairs = p_res.json()["pairs"]
    assert len(pairs) >= 3

    m_res = client.get("/api/pandharipande-thomas-bps/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_pairs_count"] >= 3


def test_wave71_evaluate_pandharipande_thomas_bps():
    res = client.post(
        "/api/pandharipande-thomas-bps/evaluate-pt-bps",
        json={
            "pair_id": "PT-STABLE-PAIR-CY3-01",
            "euler_char": 1,
            "curve_degree": 2,
            "barrier_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "PT_BPS_LOCKED"
    assert data["gv_integrality_verified"] is True


def test_wave71_joyce_song_invariants_and_metrics():
    i_res = client.get("/api/joyce-song-hall/invariants")
    assert i_res.status_code == 200
    invariants = i_res.json()["invariants"]
    assert len(invariants) >= 3

    m_res = client.get("/api/joyce-song-hall/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_invariants_count"] >= 3


def test_wave71_evaluate_joyce_song_hall():
    res = client.post(
        "/api/joyce-song-hall/evaluate-joyce-song",
        json={
            "invariant_id": "JOYCE-SONG-HALL-ALGEBRA-01",
            "chern_rank": 2,
            "behrend_weight": 1,
            "firewall_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "JOYCE_SONG_HALL_LOCKED"
    assert data["hall_identity_verified"] is True


def test_wave71_planetary_ring_current_tori_and_metrics():
    t_res = client.get("/api/planetary-ring-current/tori")
    assert t_res.status_code == 200
    tori = t_res.json()["tori"]
    assert len(tori) >= 3

    m_res = client.get("/api/planetary-ring-current/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_tori_count"] >= 3


def test_wave71_harvest_planetary_ring_current_power():
    res = client.post(
        "/api/planetary-ring-current/harvest-ring-current-power",
        json={
            "torus_id": "RING-CURRENT-TORUS-01",
            "alfven_multiplier": 1.05,
            "alfven_efficiency": 0.991,
            "dispatch_duration_s": 60.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "RING_CURRENT_POWER_DISPATCHED"
    assert data["alfven_coupling_state"] == "RING_CURRENT_ALFVEN_LOCKED"
    assert data["harvested_power_gw"] > 0.0
