"""
Unit and Integration Tests for Wave 31: Witten Chern-Simons TQFT, AdS/BCFT QES Islands,
Geometric Langlands S-Duality & Alcubierre-Lentz Solitonic Warp-Field Matrix.
Covers:
- Capability 113: Witten Chern-Simons 3-Manifold TQFT & Jones Polynomial Knot Invariant Shield
- Capability 114: AdS/BCFT Takayanagi Island Quantum Extremal Surface & Page Curve Firewall Auditor
- Capability 115: Langlands-Kapustin Electric-Magnetic S-Duality & Geometric Langlands Synchronizer
- Option B Wave 31: Sovereign Planetary Zero-Loss Alcubierre-Lentz Solitonic Warp-Field Transit Matrix
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.alcubierre_lentz_warp.alcubierre_lentz_warp import (
    get_alcubierre_lentz_warp_matrix,
)
from app.services.chern_simons_tqft.chern_simons_tqft import (
    get_chern_simons_tqft_shield,
)
from app.services.geometric_langlands.geometric_langlands import (
    get_geometric_langlands_synchronizer,
)
from app.services.quantum_extremal_island.quantum_extremal_island import (
    get_quantum_extremal_island_auditor,
)


@pytest.fixture
def client():
    return TestClient(app)


# ==============================================================================
# Capability 113: Witten Chern-Simons 3-Manifold TQFT & Jones Knot Shield Tests
# ==============================================================================


def test_chern_simons_tqft_service():
    shield = get_chern_simons_tqft_shield()
    manifolds = shield.get_manifolds()
    assert len(manifolds) >= 3
    manifold_id = manifolds[0]["manifold_id"]

    res = shield.evaluate_invariant(
        manifold_id=manifold_id,
        gauge_rank_n=3,
        chern_simons_level_k=10,
        knot_crossings=4,
        framing_counterterm_gain=1.25,
    )
    assert res["manifold_id"] == manifold_id
    assert res["reidemeister_invariance_verified"] is True
    assert res["invariant_fidelity_pct"] > 99.99
    assert res["anomaly_suppression_db"] > 140.0
    assert res["status"] == "CHERN_SIMONS_INVARIANT_LOCKED"

    metrics = shield.get_tqft_metrics()
    assert metrics["active_three_manifolds"] >= 3
    assert metrics["reidemeister_invariance_enforced"] is True


def test_chern_simons_tqft_api(client):
    man_res = client.get("/api/chern-simons-tqft/manifolds")
    assert man_res.status_code == 200
    assert len(man_res.json()["manifolds"]) >= 3

    eval_res = client.post(
        "/api/chern-simons-tqft/evaluate-invariant",
        json={
            "manifold_id": "CS-SU2-S3-TREFOIL-01",
            "gauge_rank_n": 2,
            "chern_simons_level_k": 8,
            "knot_crossings": 4,
            "framing_counterterm_gain": 1.2,
        },
    )
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert data["manifold_id"] == "CS-SU2-S3-TREFOIL-01"
    assert data["reidemeister_invariance_verified"] is True
    assert data["status"] == "CHERN_SIMONS_INVARIANT_LOCKED"

    miss_res = client.post(
        "/api/chern-simons-tqft/evaluate-invariant",
        json={"manifold_id": "CS-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/chern-simons-tqft/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["reidemeister_invariance_enforced"] is True


# ==============================================================================
# Capability 114: AdS/BCFT Takayanagi Island QES & Page Curve Auditor Tests
# ==============================================================================


def test_quantum_extremal_island_service():
    auditor = get_quantum_extremal_island_auditor()
    horizons = auditor.get_horizons()
    assert len(horizons) >= 3
    horizon_id = horizons[0]["horizon_id"]

    res = auditor.audit_page_curve(
        horizon_id=horizon_id,
        bekenstein_hawking_entropy_s0=180.0,
        evaporation_page_ratio=1.35,
        cft_central_charge_c=24,
        wormhole_saddle_gain=1.25,
    )
    assert res["horizon_id"] == horizon_id
    assert res["island_saddle_dominant"] is True
    assert res["amps_firewall_residual"] == 0.0
    assert res["unitarity_fidelity_pct"] > 99.99
    assert res["firewall_quench_db"] > 145.0
    assert res["status"] == "QES_PAGE_CURVE_UNITARY"

    metrics = auditor.get_qes_metrics()
    assert metrics["active_qes_horizons"] >= 3
    assert metrics["amps_firewall_free"] is True


def test_quantum_extremal_island_api(client):
    hor_res = client.get("/api/quantum-extremal-island/horizons")
    assert hor_res.status_code == 200
    assert len(hor_res.json()["horizons"]) >= 3

    aud_res = client.post(
        "/api/quantum-extremal-island/audit-page-curve",
        json={
            "horizon_id": "QES-PAGE-JT-ADS2-01",
            "bekenstein_hawking_entropy_s0": 180.0,
            "evaporation_page_ratio": 1.35,
            "cft_central_charge_c": 24,
            "wormhole_saddle_gain": 1.25,
        },
    )
    assert aud_res.status_code == 200
    data = aud_res.json()
    assert data["horizon_id"] == "QES-PAGE-JT-ADS2-01"
    assert data["island_saddle_dominant"] is True
    assert data["status"] == "QES_PAGE_CURVE_UNITARY"

    miss_res = client.post(
        "/api/quantum-extremal-island/audit-page-curve",
        json={"horizon_id": "QES-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/quantum-extremal-island/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["amps_firewall_free"] is True


# ==============================================================================
# Capability 115: Langlands-Kapustin S-Duality & Geometric Langlands Tests
# ==============================================================================


def test_geometric_langlands_service():
    sync = get_geometric_langlands_synchronizer()
    sheaves = sync.get_sheaves()
    assert len(sheaves) >= 3
    sheaf_id = sheaves[0]["sheaf_id"]

    res = sync.sync_s_duality(
        sheaf_id=sheaf_id,
        yang_mills_coupling_g=1.18,
        theta_vacuum_angle_pi=0.25,
        riemann_genus=3,
        hecke_eigen_gain=1.25,
    )
    assert res["sheaf_id"] == sheaf_id
    assert res["kapustin_witten_a_b_brane_dual"] is True
    assert res["duality_coherence_pct"] > 99.99
    assert res["hecke_spectral_lock_db"] > 145.0
    assert res["status"] == "LANGLANDS_SDUALITY_LOCKED"

    metrics = sync.get_langlands_metrics()
    assert metrics["active_langlands_sheaves"] >= 3
    assert metrics["kapustin_witten_duality_verified"] is True


def test_geometric_langlands_api(client):
    shf_res = client.get("/api/geometric-langlands/sheaves")
    assert shf_res.status_code == 200
    assert len(shf_res.json()["sheaves"]) >= 3

    sync_res = client.post(
        "/api/geometric-langlands/sync-duality",
        json={
            "sheaf_id": "LANGLANDS-SU3-PSU3-01",
            "yang_mills_coupling_g": 1.18,
            "theta_vacuum_angle_pi": 0.25,
            "riemann_genus": 3,
            "hecke_eigen_gain": 1.25,
        },
    )
    assert sync_res.status_code == 200
    data = sync_res.json()
    assert data["sheaf_id"] == "LANGLANDS-SU3-PSU3-01"
    assert data["kapustin_witten_a_b_brane_dual"] is True
    assert data["status"] == "LANGLANDS_SDUALITY_LOCKED"

    miss_res = client.post(
        "/api/geometric-langlands/sync-duality",
        json={"sheaf_id": "LANGLANDS-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/geometric-langlands/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["kapustin_witten_duality_verified"] is True


# ==============================================================================
# Option B Wave 31: Alcubierre-Lentz Solitonic Warp-Field Transit Matrix Tests
# ==============================================================================


def test_alcubierre_lentz_warp_service():
    matrix = get_alcubierre_lentz_warp_matrix()
    corridors = matrix.get_corridors()
    assert len(corridors) >= 3
    corridor_id = corridors[0]["corridor_id"]

    res = matrix.engage_soliton_transit(
        corridor_id=corridor_id,
        target_velocity_c=0.28,
        soliton_radius_m=45.0,
        positive_plasma_recovery_gain=1.15,
    )
    assert res["corridor_id"] == corridor_id
    assert res["positive_energy_only_t00_ge_0"] is True
    assert res["zero_exotic_negative_mass"] is True
    assert res["zero_fissile_waste"] is True
    assert res["regenerative_bus_output_gw"] > 150.0
    assert res["shell_confinement_efficiency_pct"] > 93.0
    assert res["status"] == "LENTZ_SOLITON_TRANSIT_OPTIMAL"

    metrics = matrix.get_warp_metrics()
    assert metrics["active_soliton_corridors"] >= 3
    assert metrics["positive_energy_wec_enforced"] is True
    assert metrics["zero_fissile_actinide_waste"] is True


def test_alcubierre_lentz_warp_api(client):
    cor_res = client.get("/api/alcubierre-lentz-warp/corridors")
    assert cor_res.status_code == 200
    assert len(cor_res.json()["corridors"]) >= 3

    eng_res = client.post(
        "/api/alcubierre-lentz-warp/engage-soliton",
        json={
            "corridor_id": "LENTZ-SOLITON-LEO-GEO-01",
            "target_velocity_c": 0.28,
            "soliton_radius_m": 45.0,
            "positive_plasma_recovery_gain": 1.15,
        },
    )
    assert eng_res.status_code == 200
    data = eng_res.json()
    assert data["corridor_id"] == "LENTZ-SOLITON-LEO-GEO-01"
    assert data["positive_energy_only_t00_ge_0"] is True
    assert data["zero_fissile_waste"] is True
    assert data["status"] == "LENTZ_SOLITON_TRANSIT_OPTIMAL"

    miss_res = client.post(
        "/api/alcubierre-lentz-warp/engage-soliton",
        json={"corridor_id": "LENTZ-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/alcubierre-lentz-warp/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["positive_energy_wec_enforced"] is True
