"""Wave 38 Pytest Suite: Subfactor Jones Planars, BV-BRST Cohomology, p-Adic Holography & Spin-Caloritronic Grid."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.adic_p_adic_holography import get_p_adic_holography_shield
from app.services.bv_brst_cohomology import get_bv_brst_cohomology_shield
from app.services.spin_caloritronic_power import get_spin_caloritronic_power_grid
from app.services.subfactor_jones_planars import get_subfactor_jones_planar_firewall

client = TestClient(app)


def test_subfactor_jones_planars_endpoints():
    res = client.get("/api/subfactor-jones-planars/algebras")
    assert res.status_code == 200
    algebras = res.json()["algebras"]
    assert len(algebras) == 3

    compress_res = client.post(
        "/api/subfactor-jones-planars/compress-tangle",
        json={
            "algebra_id": "SUBFACTOR-JONES-E8-01",
            "jones_level_k": 28,
            "tangle_boxes": 16,
            "tl_strand_count": 12,
            "planar_gain": 1.6,
        },
    )
    assert compress_res.status_code == 200
    body = compress_res.json()
    assert body["status"] == "SUBFACTOR_TANGLE_SEALED"
    assert body["planar_isotopy_certified"] is True
    assert body["subfactor_suppression_db"] > 162.0
    assert body["bimodule_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/subfactor-jones-planars/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["active_planar_algebras"] == 3


def test_bv_brst_cohomology_endpoints():
    res = client.get("/api/bv-brst-cohomology/complexes")
    assert res.status_code == 200
    complexes = res.json()["complexes"]
    assert len(complexes) == 3

    enforce_res = client.post(
        "/api/bv-brst-cohomology/enforce-master",
        json={
            "complex_id": "BV-MASTER-YANG-MILLS-01",
            "ghost_number_grading": 2,
            "antifield_bracket_order": 4,
            "gauge_fermion_xi": 1.2,
            "brst_gain": 1.6,
        },
    )
    assert enforce_res.status_code == 200
    body = enforce_res.json()
    assert body["status"] == "BV_BRST_MASTER_SEALED"
    assert body["master_equation_certified"] is True
    assert body["nilpotent_q2_suppression_db"] > 161.0
    assert body["cohomology_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/bv-brst-cohomology/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["quantum_master_equation_locked"] is True


def test_p_adic_holography_endpoints():
    res = client.get("/api/adic-p-adic-holography/trees")
    assert res.status_code == 200
    trees = res.json()["trees"]
    assert len(trees) == 3

    seal_res = client.post(
        "/api/adic-p-adic-holography/seal-ultrametric",
        json={
            "tree_id": "PADIC-BRUHAT-TITS-P3-01",
            "prime_base_p": 3,
            "tree_depth_n": 12,
            "vladimirov_order": 2.0,
            "ultrametric_gain": 1.6,
        },
    )
    assert seal_res.status_code == 200
    body = seal_res.json()
    assert body["status"] == "PADIC_ULTRAMETRIC_SEALED"
    assert body["non_archimedean_certified"] is True
    assert body["ultrametric_isolation_db"] > 162.0
    assert body["tree_holographic_fidelity_pct"] > 99.997

    metrics_res = client.get("/api/adic-p-adic-holography/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["non_archimedean_inequality_locked"] is True


def test_spin_caloritronic_power_endpoints():
    res = client.get("/api/spin-caloritronic-power/arrays")
    assert res.status_code == 200
    arrays = res.json()["arrays"]
    assert len(arrays) == 3

    harvest_res = client.post(
        "/api/spin-caloritronic-power/harvest-magnon",
        json={
            "array_id": "MAGNON-YIG-PT-01",
            "magnon_freq_ghz": 42.0,
            "spin_seebeck_gain": 1.6,
        },
    )
    assert harvest_res.status_code == 200
    body = harvest_res.json()
    assert body["status"] == "SPIN_CALORITRONIC_GRID_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 300.0

    metrics_res = client.get("/api/spin-caloritronic-power/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fissile_waste"] is True


def test_wave38_service_clamping_bounds():
    sub_res = get_subfactor_jones_planar_firewall().compress_planar_tangle(
        "TEMPERLEY-LIEB-SU2-02",
        jones_level_k=500,
        tangle_boxes=400,
        tl_strand_count=200,
        planar_gain=5.0,
    )
    assert sub_res["jones_level_k"] == 128
    assert sub_res["tangle_boxes"] == 128
    assert sub_res["tl_strand_count"] == 64
    assert sub_res["planar_gain"] == 2.5

    bv_res = get_bv_brst_cohomology_shield().enforce_quantum_master_equation(
        "BRST-STRING-FIELD-02",
        ghost_number_grading=99,
        antifield_bracket_order=99,
        gauge_fermion_xi=20.0,
        brst_gain=0.1,
    )
    assert bv_res["ghost_number_grading"] == 16
    assert bv_res["antifield_bracket_order"] == 32
    assert bv_res["gauge_fermion_xi"] == 6.0
    assert bv_res["brst_gain"] == 0.85

    padic_res = get_p_adic_holography_shield().seal_ultrametric_tree(
        "BERKOVICH-ANALYTIC-P5-02",
        prime_base_p=500,
        tree_depth_n=200,
        vladimirov_order=50.0,
    )
    assert padic_res["prime_base_p"] == 97
    assert padic_res["tree_depth_n"] == 64
    assert padic_res["vladimirov_order"] == 12.0

    spin_res = get_spin_caloritronic_power_grid().harvest_magnon_baseload(
        "POLARITON-MAGNON-03",
        magnon_freq_ghz=999.0,
        spin_seebeck_gain=5.0,
    )
    assert spin_res["magnon_freq_ghz"] == 240.0
    assert spin_res["spin_seebeck_gain"] == 2.5


def test_wave38_unknown_ids_return_404():
    assert (
        client.post(
            "/api/subfactor-jones-planars/compress-tangle",
            json={"algebra_id": "NO-SUCH-ALG"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/bv-brst-cohomology/enforce-master",
            json={"complex_id": "NO-SUCH-CPX"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/adic-p-adic-holography/seal-ultrametric",
            json={"tree_id": "NO-SUCH-TREE"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/spin-caloritronic-power/harvest-magnon",
            json={"array_id": "NO-SUCH-ARRAY"},
        ).status_code
        == 404
    )
