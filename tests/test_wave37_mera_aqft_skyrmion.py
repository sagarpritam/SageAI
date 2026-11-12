"""Wave 37 Pytest Suite: MERA Tensor RG, AQFT Haag-Kastler Net, BPST Instanton Shield & Time-Crystal Grid."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.algebraic_qft_haag import get_algebraic_qft_haag_shield
from app.services.mera_tensor_renorm import get_mera_tensor_renorm_firewall
from app.services.skyrmion_instanton_qcd import get_skyrmion_instanton_shield
from app.services.time_crystal_power import get_time_crystal_power_grid

client = TestClient(app)


def test_mera_tensor_renorm_endpoints():
    res = client.get("/api/mera-tensor-renorm/networks")
    assert res.status_code == 200
    networks = res.json()["networks"]
    assert len(networks) == 3

    renorm_res = client.post(
        "/api/mera-tensor-renorm/renormalize-cone",
        json={
            "network_id": "MERA-TERNARY-ADS3-01",
            "bond_dim_chi": 32,
            "rg_layers": 14,
            "central_charge": 12.0,
            "disentangler_gain": 1.6,
        },
    )
    assert renorm_res.status_code == 200
    body = renorm_res.json()
    assert body["status"] == "MERA_CAUSAL_CONE_SEALED"
    assert body["causal_cone_certified"] is True
    assert body["causal_cone_suppression_db"] > 161.0
    assert body["isometry_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/mera-tensor-renorm/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["active_mera_networks"] == 3


def test_algebraic_qft_haag_endpoints():
    res = client.get("/api/algebraic-qft-haag/algebras")
    assert res.status_code == 200
    algebras = res.json()["algebras"]
    assert len(algebras) == 3

    seal_res = client.post(
        "/api/algebraic-qft-haag/seal-net",
        json={
            "algebra_id": "AQFT-HAAG-DIAMOND-01",
            "diamond_radius": 2.4,
            "split_distance": 0.45,
            "modular_temp": 1.0,
            "nuclearity_gain": 1.6,
        },
    )
    assert seal_res.status_code == 200
    body = seal_res.json()
    assert body["status"] == "AQFT_HAAG_NET_SEALED"
    assert body["microcausality_verified"] is True
    assert body["locality_isolation_db"] > 159.0
    assert body["tomita_modular_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/algebraic-qft-haag/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["einstein_microcausality_locked"] is True


def test_skyrmion_instanton_endpoints():
    res = client.get("/api/skyrmion-instanton-qcd/lattices")
    assert res.status_code == 200
    lattices = res.json()["lattices"]
    assert len(lattices) == 3

    clamp_res = client.post(
        "/api/skyrmion-instanton-qcd/clamp-instanton",
        json={
            "lattice_id": "BPST-INSTANTON-SU2-01",
            "winding_q": 2,
            "instanton_size_rho": 0.35,
            "gauge_coupling": 1.25,
            "theta_clamp_gain": 1.6,
        },
    )
    assert clamp_res.status_code == 200
    body = clamp_res.json()
    assert body["status"] == "SKYRMION_TOPOLOGY_SEALED"
    assert body["cp_symmetry_protected"] is True
    assert body["tunneling_suppression_db"] > 160.0
    assert body["topological_winding_fidelity_pct"] > 99.997

    metrics_res = client.get("/api/skyrmion-instanton-qcd/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["theta_vacuum_stabilized"] is True


def test_time_crystal_power_endpoints():
    res = client.get("/api/time-crystal-power/arrays")
    assert res.status_code == 200
    arrays = res.json()["arrays"]
    assert len(arrays) == 3

    harvest_res = client.post(
        "/api/time-crystal-power/harvest-subharmonic",
        json={
            "array_id": "TIME-CRYSTAL-ORBIT-01",
            "shapiro_freq_ghz": 34.0,
            "ratchet_gain": 1.6,
        },
    )
    assert harvest_res.status_code == 200
    body = harvest_res.json()
    assert body["status"] == "TIME_CRYSTAL_GRID_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 280.0

    metrics_res = client.get("/api/time-crystal-power/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fissile_waste"] is True


def test_wave37_service_clamping_bounds():
    mera_res = get_mera_tensor_renorm_firewall().renormalize_causal_cone(
        "CMERA-CONTINUOUS-UV-02",
        bond_dim_chi=4096,
        rg_layers=200,
        disentangler_gain=5.0,
    )
    assert mera_res["bond_dim_chi"] == 512
    assert mera_res["rg_layers"] == 64
    assert mera_res["disentangler_gain"] == 2.5

    aqft_res = get_algebraic_qft_haag_shield().seal_haag_net(
        "TOMITA-WEDGE-BISOGNANO-02",
        diamond_radius=100.0,
        split_distance=20.0,
        nuclearity_gain=0.1,
    )
    assert aqft_res["diamond_radius"] == 20.0
    assert aqft_res["split_distance"] == 5.0
    assert aqft_res["nuclearity_gain"] == 0.85

    sky_res = get_skyrmion_instanton_shield().clamp_instanton_tunneling(
        "CHIRAL-SKYRMION-NET-02",
        winding_q=100,
        instanton_size_rho=10.0,
    )
    assert sky_res["winding_number_q"] == 32
    assert sky_res["instanton_size_rho"] == 2.5

    tc_res = get_time_crystal_power_grid().harvest_subharmonic_baseload(
        "SUBHARMONIC-RING-03",
        shapiro_freq_ghz=999.0,
        ratchet_gain=5.0,
    )
    assert tc_res["shapiro_freq_ghz"] == 200.0
    assert tc_res["ratchet_gain"] == 2.5


def test_wave37_unknown_ids_return_404():
    assert (
        client.post(
            "/api/mera-tensor-renorm/renormalize-cone",
            json={"network_id": "NO-SUCH-NET"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/algebraic-qft-haag/seal-net",
            json={"algebra_id": "NO-SUCH-NET"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/skyrmion-instanton-qcd/clamp-instanton",
            json={"lattice_id": "NO-SUCH-LAT"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/time-crystal-power/harvest-subharmonic",
            json={"array_id": "NO-SUCH-ARRAY"},
        ).status_code
        == 404
    )
