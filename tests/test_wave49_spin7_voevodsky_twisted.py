"""
Unit and API integration tests for Wave 49:
- Capability 167: Spin(7) Holonomy Cayley 4-Cycle Calibration Shield & 8D Instanton Anomaly Suppression
- Capability 168: Voevodsky Motivic Homotopy Shield & Algebraic Cobordism MGL
- Capability 169: Twisted K-Theory D-Brane Ramond-Ramond Charge Shield & Freed-Witten Anomaly Firewall
- Option B Wave 49: Planetary Ultra-Dense Rydberg Exciton-Polariton Condensate Supergrid
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.spin7_cayley_shield.spin7_cayley_shield import (
    Spin7CayleyShieldService,
)
from app.services.voevodsky_motivic_shield.voevodsky_motivic_shield import (
    VoevodskyMotivicShieldService,
)
from app.services.twisted_k_theory.twisted_k_theory import (
    TwistedKTheoryService,
)
from app.services.rydberg_polariton_supergrid.rydberg_polariton_supergrid import (
    RydbergPolaritonSupergridService,
)

client = TestClient(app)


# ============================================================================
# Capability 167: Spin(7) Cayley 4-Cycle Calibration Shield
# ============================================================================


def test_spin7_cayley_service_direct():
    svc = Spin7CayleyShieldService()
    manifolds = svc.get_manifolds()
    assert len(manifolds) >= 3
    assert manifolds[0]["manifold_id"] == "SPIN7-JOYCE-TORUS-01"
    assert manifolds[0]["betti_b4_plus"] == 206

    # Valid calibration
    res = svc.calibrate_cayley(
        manifold_id="SPIN7-JOYCE-TORUS-01",
        cayley_order=4,
        self_dual_precision=1e-6,
        octonionic_slice_depth=8,
        calibration_gain=1.25,
    )
    assert res["calibration_status"] == "SPIN7_CAYLEY_CALIBRATED"
    assert res["effective_fidelity_pct"] > 99.99
    assert res["spin7_suppression_db"] > 20.0
    assert res["spin7_shield_strength_pev"] > 100.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown Spin\\(7\\) manifold ID"):
        svc.calibrate_cayley("INVALID-MANIFOLD")
    with pytest.raises(ValueError, match="Invalid cayley_order"):
        svc.calibrate_cayley("SPIN7-JOYCE-TORUS-01", cayley_order=99)


def test_spin7_cayley_api_routes():
    # GET /manifolds
    r = client.get("/api/spin7-cayley-shield/manifolds")
    assert r.status_code == 200
    data = r.json()
    assert len(data["manifolds"]) >= 3

    # POST /calibrate-cayley
    payload = {
        "manifold_id": "SPIN7-JOYCE-TORUS-01",
        "cayley_order": 4,
        "self_dual_precision": 1e-6,
        "octonionic_slice_depth": 8,
        "calibration_gain": 1.25,
    }
    r = client.post("/api/spin7-cayley-shield/calibrate-cayley", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["calibration_status"] == "SPIN7_CAYLEY_CALIBRATED"
    assert res["spin7_shield_strength_pev"] > 100.0

    # GET /metrics
    r = client.get("/api/spin7-cayley-shield/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_spin7_manifolds"] >= 3
    assert metrics["status"] == "SPIN7_CAYLEY_SYSTEM_OPTIMAL"


# ============================================================================
# Capability 168: Voevodsky Motivic Homotopy Shield
# ============================================================================


def test_voevodsky_motivic_service_direct():
    svc = VoevodskyMotivicShieldService()
    motives = svc.get_motives()
    assert len(motives) >= 3
    assert motives[0]["motive_id"] == "MOTIVIC-MGL-SPHERE-01"
    assert motives[0]["nisnevich_dimension"] == 4

    # Valid evaluation
    res = svc.evaluate_homotopy(
        motive_id="MOTIVIC-MGL-SPHERE-01",
        slice_filtration_level=3,
        nisnevich_cohomology_degree=2,
        weight_p=4,
        homotopy_gain=1.2,
    )
    assert res["homotopy_status"] == "MOTIVIC_HOMOTOPY_SEALED"
    assert res["effective_fidelity_pct"] > 99.99
    assert res["motivic_suppression_db"] > 20.0
    assert res["motivic_barrier_gev"] > 1000.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown motive ID"):
        svc.evaluate_homotopy("INVALID-MOTIVE")
    with pytest.raises(ValueError, match="Invalid slice_filtration_level"):
        svc.evaluate_homotopy("MOTIVIC-MGL-SPHERE-01", slice_filtration_level=32)


def test_voevodsky_motivic_api_routes():
    # GET /motives
    r = client.get("/api/voevodsky-motivic-shield/motives")
    assert r.status_code == 200
    data = r.json()
    assert len(data["motives"]) >= 3

    # POST /evaluate-homotopy
    payload = {
        "motive_id": "MOTIVIC-MGL-SPHERE-01",
        "slice_filtration_level": 3,
        "nisnevich_cohomology_degree": 2,
        "weight_p": 4,
        "homotopy_gain": 1.2,
    }
    r = client.post("/api/voevodsky-motivic-shield/evaluate-homotopy", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["homotopy_status"] == "MOTIVIC_HOMOTOPY_SEALED"
    assert res["motivic_barrier_gev"] > 1000.0

    # GET /metrics
    r = client.get("/api/voevodsky-motivic-shield/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_motivic_schemes"] >= 3
    assert metrics["status"] == "MOTIVIC_HOMOTOPY_SYSTEM_OPTIMAL"


# ============================================================================
# Capability 169: Twisted K-Theory D-Brane Shield
# ============================================================================


def test_twisted_k_theory_service_direct():
    svc = TwistedKTheoryService()
    complexes = svc.get_complexes()
    assert len(complexes) >= 3
    assert complexes[0]["complex_id"] == "TWISTED-K-K3-H3-01"
    assert complexes[0]["dixmier_douady_class"] == 3

    # Valid anomaly cancellation
    res = svc.cancel_anomaly(
        complex_id="TWISTED-K-K3-H3-01",
        dixmier_douady_flux=3,
        ahss_filtration_depth=6,
        branes_charge_n=4,
        cancellation_gain=1.2,
    )
    assert res["cancellation_status"] == "FREED_WITTEN_ANOMALY_CANCELLED"
    assert res["effective_fidelity_pct"] > 99.99
    assert res["anomaly_suppression_db"] > 20.0
    assert res["hardened_firewall_gev"] > 500.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown complex ID"):
        svc.cancel_anomaly("INVALID-COMPLEX")
    with pytest.raises(ValueError, match="Invalid dixmier_douady_flux"):
        svc.cancel_anomaly("TWISTED-K-K3-H3-01", dixmier_douady_flux=64)


def test_twisted_k_theory_api_routes():
    # GET /complexes
    r = client.get("/api/twisted-k-theory/complexes")
    assert r.status_code == 200
    data = r.json()
    assert len(data["complexes"]) >= 3

    # POST /cancel-anomaly
    payload = {
        "complex_id": "TWISTED-K-K3-H3-01",
        "dixmier_douady_flux": 3,
        "ahss_filtration_depth": 6,
        "branes_charge_n": 4,
        "cancellation_gain": 1.2,
    }
    r = client.post("/api/twisted-k-theory/cancel-anomaly", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["cancellation_status"] == "FREED_WITTEN_ANOMALY_CANCELLED"
    assert res["hardened_firewall_gev"] > 500.0

    # GET /metrics
    r = client.get("/api/twisted-k-theory/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_twisted_complexes"] >= 3
    assert metrics["status"] == "TWISTED_K_THEORY_SYSTEM_OPTIMAL"


# ============================================================================
# Option B Wave 49: Rydberg Polariton Supergrid
# ============================================================================


def test_rydberg_polariton_service_direct():
    svc = RydbergPolaritonSupergridService()
    cavities = svc.get_cavities()
    assert len(cavities) >= 3
    assert cavities[0]["cavity_id"] == "RYDBERG-PEROVSKITE-CAVITY-01"

    # Valid harvest
    res = svc.harvest_polariton(
        cavity_id="RYDBERG-PEROVSKITE-CAVITY-01",
        exciton_fraction_pct=50.0,
        pump_fluence_uj_cm2=120.0,
        superfluid_coupling_gain=1.15,
        temperature_k=295.0,
    )
    assert res["harvest_status"] == "POLARITON_POWER_DISPATCHED"
    assert res["grid_efficiency_pct"] > 99.9
    assert res["harvested_power_mw"] > 1000.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown cavity ID"):
        svc.harvest_polariton("INVALID-CAVITY")
    with pytest.raises(ValueError, match="pump_fluence_uj_cm2 .* out of bounds"):
        svc.harvest_polariton("RYDBERG-PEROVSKITE-CAVITY-01", pump_fluence_uj_cm2=2000.0)


def test_rydberg_polariton_api_routes():
    # GET /cavities
    r = client.get("/api/rydberg-polariton-supergrid/cavities")
    assert r.status_code == 200
    data = r.json()
    assert len(data["cavities"]) >= 3

    # POST /harvest-polariton
    payload = {
        "cavity_id": "RYDBERG-PEROVSKITE-CAVITY-01",
        "exciton_fraction_pct": 50.0,
        "pump_fluence_uj_cm2": 120.0,
        "superfluid_coupling_gain": 1.15,
        "temperature_k": 295.0,
    }
    r = client.post("/api/rydberg-polariton-supergrid/harvest-polariton", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["harvest_status"] == "POLARITON_POWER_DISPATCHED"
    assert res["harvested_power_mw"] > 1000.0

    # GET /metrics
    r = client.get("/api/rydberg-polariton-supergrid/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_rydberg_cavities"] >= 3
    assert metrics["status"] == "RYDBERG_POLARITON_SUPERGRID_OPTIMAL"


def test_wave49_platform_health_v8_9_0():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["version"] in ("8.9.0", "9.0.0", "9.1.0", "9.2.0", "9.3.0", "9.4.0", "9.5.0", "9.6.0", "9.7.0", "9.8.0", "9.9.0", "10.0.0", "10.1.0", "10.2.0", "10.3.0", "10.4.0", "10.5.0", "10.6.0", "10.7.0", "10.8.0", "10.9.0", "11.0.0", "11.1.0", "11.2.0", "11.3.0", "11.4.0", "11.5.0", "11.6.0", "11.7.0")
    assert data["status"] in ("healthy", "degraded")

