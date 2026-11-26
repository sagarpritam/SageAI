from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_wave77_health_version_11_7_0():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("11.7.0")


def test_wave77_kac_moody_algebras_and_metrics():
    a_res = client.get("/api/kac-moody-affine/algebras")
    assert a_res.status_code == 200
    algebras = a_res.json()["algebras"]
    assert len(algebras) >= 3

    m_res = client.get("/api/kac-moody-affine/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_algebras_count"] >= 3


def test_wave77_evaluate_kac_moody_affine():
    res = client.post(
        "/api/kac-moody-affine/evaluate-kac-moody",
        json={
            "algebra_id": "KAC-MOODY-AFFINE-01",
            "central_level_k": 2,
            "imaginary_root_mult": 4,
            "shield_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "KAC_MOODY_AFFINE_LOCKED"
    assert data["weyl_kac_character_verified"] is True


def test_wave77_frenkel_voa_algebras_and_metrics():
    a_res = client.get("/api/frenkel-voa-chiral/algebras")
    assert a_res.status_code == 200
    algebras = a_res.json()["algebras"]
    assert len(algebras) >= 3

    m_res = client.get("/api/frenkel-voa-chiral/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_algebras_count"] >= 3


def test_wave77_evaluate_frenkel_voa_chiral():
    res = client.post(
        "/api/frenkel-voa-chiral/evaluate-voa-chiral",
        json={
            "voa_id": "FRENKEL-VOA-CHIRAL-01",
            "central_charge_c": 24,
            "zhu_rank": 4,
            "barrier_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "FRENKEL_VOA_CHIRAL_LOCKED"
    assert data["borcherds_identity_verified"] is True


def test_wave77_borcherds_moonshine_algebras_and_metrics():
    a_res = client.get("/api/borcherds-moonshine/algebras")
    assert a_res.status_code == 200
    algebras = a_res.json()["algebras"]
    assert len(algebras) >= 3

    m_res = client.get("/api/borcherds-moonshine/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_algebras_count"] >= 3


def test_wave77_evaluate_borcherds_moonshine():
    res = client.post(
        "/api/borcherds-moonshine/evaluate-borcherds-moonshine",
        json={
            "moonshine_id": "BORCHERDS-MONSTER-VOA-01",
            "denominator_rank": 2,
            "hauptmodul_order": 1,
            "firewall_gain": 1.25,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "BORCHERDS_MOONSHINE_LOCKED"
    assert data["hauptmodul_j_verified"] is True


def test_wave77_planetary_plasmapause_waveguides_and_metrics():
    w_res = client.get("/api/planetary-plasmapause/waveguides")
    assert w_res.status_code == 200
    waveguides = w_res.json()["waveguides"]
    assert len(waveguides) >= 3

    m_res = client.get("/api/planetary-plasmapause/metrics")
    assert m_res.status_code == 200
    assert m_res.json()["active_waveguides_count"] >= 3


def test_wave77_harvest_planetary_plasmapause_power():
    res = client.post(
        "/api/planetary-plasmapause/harvest-plasmapause-power",
        json={
            "waveguide_id": "PLASMAPAUSE-CHORUS-01",
            "whistler_multiplier": 1.05,
            "waveguide_efficiency": 0.996,
            "dispatch_duration_s": 60.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "PLASMAPAUSE_POWER_DISPATCHED"
    assert data["whistler_coupling_state"] == "PLASMAPAUSE_WHISTLER_LOCKED"
    assert data["harvested_power_gw"] > 0.0
