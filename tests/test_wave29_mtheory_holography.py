"""
Unit and Integration Tests for Wave 29: 11D M-Theory G2 Compactification,
Holographic AdS/CFT HaPPY QEC, Topological K-Theory D-Branes & Kugelblitz Generator.
Covers:
- Capability 107: 11D M-Theory G2-Manifold Supergravity Compactifier
- Capability 108: Holographic AdS/CFT HaPPY Tensor Network Quantum Error-Corrector
- Capability 109: Topological K-Theory D-Brane Charge & Anomaly Cancellation Classifier
- Option B Wave 29: Sovereign Planetary Kugelblitz Micro-Black-Hole Hawking Power Generator
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.happy_holographic_qec.happy_holographic_qec import (
    get_happy_holographic_qec,
)
from app.services.ktheory_dbrane.ktheory_dbrane import (
    get_ktheory_dbrane_classifier,
)
from app.services.kugelblitz_hawking_generator.kugelblitz_hawking_generator import (
    get_kugelblitz_hawking_generator,
)
from app.services.m_theory_g2.m_theory_g2 import get_m_theory_g2_compactifier


@pytest.fixture
def client():
    return TestClient(app)


# ==============================================================================
# Capability 107: 11D M-Theory G2 Compactifier Tests
# ==============================================================================


def test_mtheory_g2_service():
    compactifier = get_m_theory_g2_compactifier()
    manifolds = compactifier.get_manifolds()
    assert len(manifolds) >= 3
    manifold_id = manifolds[0]["manifold_id"]

    res = compactifier.compactify_flux(
        manifold_id=manifold_id,
        eleven_d_radius_planck=18.5,
        flux_quantum_g4=4,
        torsion_damping_gain=1.15,
    )
    assert res["manifold_id"] == manifold_id
    assert res["joyce_torsion_free_verified"] is True
    assert res["chiral_generations_locked"] == 3
    assert res["compactification_stability_pct"] > 99.9
    assert 24.0 < res["alpha_gut_inverse"] < 30.0
    assert res["status"] == "M_THEORY_G2_COMPACTIFIED"

    metrics = compactifier.get_mtheory_metrics()
    assert metrics["active_g2_manifolds"] >= 3
    assert metrics["joyce_associative_form_locked"] is True


def test_mtheory_g2_api(client):
    man_res = client.get("/api/m-theory-g2/manifolds")
    assert man_res.status_code == 200
    manifolds = man_res.json()["manifolds"]
    assert len(manifolds) >= 3

    comp_res = client.post(
        "/api/m-theory-g2/compactify-flux",
        json={
            "manifold_id": "G2-JOYCE-ORBIFOLD-01",
            "eleven_d_radius_planck": 19.0,
            "flux_quantum_g4": 5,
            "torsion_damping_gain": 1.2,
        },
    )
    assert comp_res.status_code == 200
    data = comp_res.json()
    assert data["manifold_id"] == "G2-JOYCE-ORBIFOLD-01"
    assert data["joyce_torsion_free_verified"] is True
    assert data["status"] == "M_THEORY_G2_COMPACTIFIED"

    miss_res = client.post(
        "/api/m-theory-g2/compactify-flux",
        json={"manifold_id": "G2-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/m-theory-g2/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["joyce_associative_form_locked"] is True


# ==============================================================================
# Capability 108: Holographic AdS/CFT HaPPY QEC Tests
# ==============================================================================


def test_happy_holographic_service():
    qec = get_happy_holographic_qec()
    tessellations = qec.get_tessellations()
    assert len(tessellations) >= 3
    tess_id = tessellations[0]["tessellation_id"]

    res = qec.correct_erasure(
        tessellation_id=tess_id,
        boundary_erasure_pct=28.0,
        hyperbolic_layers=5,
        recovery_gain=1.15,
    )
    assert res["tessellation_id"] == tess_id
    assert res["entanglement_wedge_reconstructed"] is True
    assert res["entanglement_wedge_coverage_pct"] > 99.5
    assert res["bulk_logical_fidelity_pct"] > 99.99
    assert res["ryu_takayanagi_cut_ebits"] > 10.0
    assert res["status"] == "HAPPY_BULK_RECONSTRUCTED"

    metrics = qec.get_happy_metrics()
    assert metrics["active_happy_tessellations"] >= 3
    assert metrics["entanglement_wedge_complementarity_locked"] is True


def test_happy_holographic_api(client):
    tess_res = client.get("/api/happy-holographic-qec/tessellations")
    assert tess_res.status_code == 200
    tessellations = tess_res.json()["tessellations"]
    assert len(tessellations) >= 3

    corr_res = client.post(
        "/api/happy-holographic-qec/correct-erasure",
        json={
            "tessellation_id": "HAPPY-PENTAGON-5-4-01",
            "boundary_erasure_pct": 32.0,
            "hyperbolic_layers": 6,
            "recovery_gain": 1.25,
        },
    )
    assert corr_res.status_code == 200
    data = corr_res.json()
    assert data["tessellation_id"] == "HAPPY-PENTAGON-5-4-01"
    assert data["entanglement_wedge_reconstructed"] is True
    assert data["status"] == "HAPPY_BULK_RECONSTRUCTED"

    miss_res = client.post(
        "/api/happy-holographic-qec/correct-erasure",
        json={"tessellation_id": "HAPPY-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/happy-holographic-qec/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["entanglement_wedge_complementarity_locked"] is True


# ==============================================================================
# Capability 109: Topological K-Theory D-Brane Classifier Tests
# ==============================================================================


def test_ktheory_dbrane_service():
    classifier = get_ktheory_dbrane_classifier()
    cycles = classifier.get_cycles()
    assert len(cycles) >= 3
    cycle_id = cycles[0]["cycle_id"]

    res = classifier.classify_charge(
        cycle_id=cycle_id,
        chern_character_rank=16,
        torsion_order_n=4,
        anomaly_damping_gain=1.12,
    )
    assert res["cycle_id"] == cycle_id
    assert res["freed_witten_anomaly_canceled"] is True
    assert res["spurious_tachyon_channels_pruned"] is True
    assert res["bott_complex_parity"] == 0
    assert res["ko_real_period_slot"] == 0
    assert res["classification_fidelity_pct"] > 99.99
    assert res["status"] == "KTHEORY_CHARGE_CLASSIFIED_STABLE"

    metrics = classifier.get_ktheory_metrics()
    assert metrics["active_ktheory_cycles"] >= 3
    assert metrics["freed_witten_invariance_enforced"] is True
    assert metrics["bott_periodicity_verified"] is True


def test_ktheory_dbrane_api(client):
    cyc_res = client.get("/api/ktheory-dbrane/cycles")
    assert cyc_res.status_code == 200
    cycles = cyc_res.json()["cycles"]
    assert len(cycles) >= 3

    cls_res = client.post(
        "/api/ktheory-dbrane/classify-charge",
        json={
            "cycle_id": "KTHEORY-ABS-SPIN7-01",
            "chern_character_rank": 12,
            "torsion_order_n": 4,
            "anomaly_damping_gain": 1.15,
        },
    )
    assert cls_res.status_code == 200
    data = cls_res.json()
    assert data["cycle_id"] == "KTHEORY-ABS-SPIN7-01"
    assert data["freed_witten_anomaly_canceled"] is True
    assert data["status"] == "KTHEORY_CHARGE_CLASSIFIED_STABLE"

    miss_res = client.post(
        "/api/ktheory-dbrane/classify-charge",
        json={"cycle_id": "KTHEORY-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/ktheory-dbrane/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["bott_periodicity_verified"] is True


# ==============================================================================
# Option B Wave 29: Kugelblitz Micro-Black-Hole Hawking Power Generator Tests
# ==============================================================================


def test_kugelblitz_hawking_service():
    generator = get_kugelblitz_hawking_generator()
    cores = generator.get_cores()
    assert len(cores) >= 3
    core_id = cores[0]["core_id"]

    res = generator.harvest_hawking_power(
        core_id=core_id,
        singularity_mass_1e10_kg=5.0,
        accretion_feed_mg_s=1.58,
        penrose_coupling_gain=1.1,
    )
    assert res["core_id"] == core_id
    assert res["schwarzschild_radius_fm"] == pytest.approx(0.07425, abs=0.002)
    assert res["hawking_temperature_tk"] == pytest.approx(2.454, abs=0.05)
    assert res["gross_hawking_luminosity_gw"] > 135.0
    assert res["net_electrical_output_gw"] > 125.0
    assert res["equilibrium_evaporation_mg_s"] == pytest.approx(1.586, abs=0.05)
    assert res["thermal_equilibrium_locked"] is True
    assert res["zero_fissile_waste"] is True
    assert res["status"] == "KUGELBLITZ_HAWKING_POWER_OPTIMAL"

    metrics = generator.get_kugelblitz_metrics()
    assert metrics["active_kugelblitz_cores"] >= 3
    assert metrics["zero_fissile_actinide_waste"] is True


def test_kugelblitz_hawking_api(client):
    core_res = client.get("/api/kugelblitz-hawking/cores")
    assert core_res.status_code == 200
    cores = core_res.json()["cores"]
    assert len(cores) >= 3

    harv_res = client.post(
        "/api/kugelblitz-hawking/harvest-power",
        json={
            "core_id": "KUGELBLITZ-ORBITAL-L4-01",
            "singularity_mass_1e10_kg": 4.8,
            "accretion_feed_mg_s": 1.72,
            "penrose_coupling_gain": 1.15,
        },
    )
    assert harv_res.status_code == 200
    data = harv_res.json()
    assert data["core_id"] == "KUGELBLITZ-ORBITAL-L4-01"
    assert data["net_electrical_output_gw"] > 130.0
    assert data["zero_fissile_waste"] is True
    assert data["status"] == "KUGELBLITZ_HAWKING_POWER_OPTIMAL"

    miss_res = client.post(
        "/api/kugelblitz-hawking/harvest-power",
        json={"core_id": "KUGELBLITZ-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/kugelblitz-hawking/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fissile_actinide_waste"] is True
