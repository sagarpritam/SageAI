"""Wave 39 Pytest Suite: Topos Grothendieck Sheaf, Motivic Galois, Resurgence Transseries & Berry-Curvature Grid."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.berry_curvature_power import get_berry_curvature_power_grid
from app.services.motivic_galois_cohomology import get_motivic_galois_shield
from app.services.resurgence_transseries_shield import (
    get_resurgence_transseries_shield,
)
from app.services.topos_grothendieck_firewall import get_topos_grothendieck_firewall

client = TestClient(app)


def test_topos_grothendieck_firewall_endpoints():
    res = client.get("/api/topos-grothendieck-firewall/sites")
    assert res.status_code == 200
    assert len(res.json()["sites"]) == 3

    seal_res = client.post(
        "/api/topos-grothendieck-firewall/seal-sheaf",
        json={
            "site_id": "TOPOS-ETALE-Z3-01",
            "sheaf_dimension": 8,
            "cech_cover_rank": 12,
            "omega_classifier_depth": 6,
            "topos_gain": 1.6,
        },
    )
    assert seal_res.status_code == 200
    body = seal_res.json()
    assert body["status"] == "TOPOS_SHEAF_SEALED"
    assert body["lawvere_tierney_idempotent"] is True
    assert body["sheaf_suppression_db"] > 162.0
    assert body["topos_gluing_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/topos-grothendieck-firewall/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["active_topos_sites"] == 3


def test_motivic_galois_cohomology_endpoints():
    res = client.get("/api/motivic-galois-cohomology/motives")
    assert res.status_code == 200
    assert len(res.json()["motives"]) == 3

    seal_res = client.post(
        "/api/motivic-galois-cohomology/seal-motive",
        json={
            "motive_id": "MOTIVE-MIXED-TATE-01",
            "tate_twist_weight": 4,
            "beilinson_regulator_order": 6,
            "hodge_filtration_rank": 8,
            "motivic_gain": 1.6,
        },
    )
    assert seal_res.status_code == 200
    body = seal_res.json()
    assert body["status"] == "MOTIVIC_PERIOD_SEALED"
    assert body["galois_action_equivariant"] is True
    assert body["period_suppression_db"] > 162.0
    assert body["motivic_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/motivic-galois-cohomology/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["cosmic_galois_equivariance_locked"] is True


def test_resurgence_transseries_shield_endpoints():
    res = client.get("/api/resurgence-transseries-shield/transseries")
    assert res.status_code == 200
    assert len(res.json()["transseries"]) == 3

    resum_res = client.post(
        "/api/resurgence-transseries-shield/resum-borel",
        json={
            "transseries_id": "ECALLE-STOKES-SU2-01",
            "borel_pade_degree": 24,
            "stokes_ray_sectors": 8,
            "alien_instanton_order": 4,
            "resurgence_gain": 1.6,
        },
    )
    assert resum_res.status_code == 200
    body = resum_res.json()
    assert body["status"] == "BOREL_TRANSSERIES_SEALED"
    assert body["stokes_ambiguity_cancelled"] is True
    assert body["stokes_isolation_db"] > 162.0
    assert body["resurgence_fidelity_pct"] > 99.997

    metrics_res = client.get("/api/resurgence-transseries-shield/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["alien_bridge_cancellation_locked"] is True


def test_berry_curvature_power_endpoints():
    res = client.get("/api/berry-curvature-power/arrays")
    assert res.status_code == 200
    assert len(res.json()["arrays"]) == 3

    harvest_res = client.post(
        "/api/berry-curvature-power/harvest-berry",
        json={
            "array_id": "BERRY-MOIRE-BLG-01",
            "terahertz_pump_thz": 1.8,
            "berry_dipole_gain": 1.6,
        },
    )
    assert harvest_res.status_code == 200
    body = harvest_res.json()
    assert body["status"] == "BERRY_CURVATURE_GRID_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 300.0

    metrics_res = client.get("/api/berry-curvature-power/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fissile_waste"] is True


def test_wave39_service_clamping_bounds():
    topos_res = get_topos_grothendieck_firewall().seal_topos_sheaf(
        "LAWVERE-TIERNEY-SHEAF-02",
        sheaf_dimension=200,
        cech_cover_rank=500,
        omega_classifier_depth=100,
        topos_gain=9.0,
    )
    assert topos_res["sheaf_dimension"] == 64
    assert topos_res["cech_cover_rank"] == 128
    assert topos_res["omega_classifier_depth"] == 32
    assert topos_res["topos_gain"] == 2.5

    mot_res = get_motivic_galois_shield().seal_motivic_cycle(
        "VOEVODSKY-A1-HOMOTOPY-02",
        tate_twist_weight=99,
        beilinson_regulator_order=99,
        hodge_filtration_rank=999,
        motivic_gain=0.1,
    )
    assert mot_res["tate_twist_weight"] == 32
    assert mot_res["beilinson_regulator_order"] == 48
    assert mot_res["hodge_filtration_rank"] == 64
    assert mot_res["motivic_gain"] == 0.85

    res_out = get_resurgence_transseries_shield().resum_borel_transseries(
        "BOREL-PADE-THIMBLE-02",
        borel_pade_degree=999,
        stokes_ray_sectors=99,
        alien_instanton_order=50,
    )
    assert res_out["borel_pade_degree"] == 128
    assert res_out["stokes_ray_sectors"] == 32
    assert res_out["alien_instanton_order"] == 16

    berry_res = get_berry_curvature_power_grid().harvest_berry_baseload(
        "KAGOME-CHERN-HARVEST-03",
        terahertz_pump_thz=99.0,
        berry_dipole_gain=5.0,
    )
    assert berry_res["terahertz_pump_thz"] == 25.0
    assert berry_res["berry_dipole_gain"] == 2.5


def test_wave39_unknown_ids_return_404():
    assert (
        client.post(
            "/api/topos-grothendieck-firewall/seal-sheaf",
            json={"site_id": "NO-SUCH-SITE"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/motivic-galois-cohomology/seal-motive",
            json={"motive_id": "NO-SUCH-MOTIVE"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/resurgence-transseries-shield/resum-borel",
            json={"transseries_id": "NO-SUCH-TRANSSERIES"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/berry-curvature-power/harvest-berry",
            json={"array_id": "NO-SUCH-ARRAY"},
        ).status_code
        == 404
    )
