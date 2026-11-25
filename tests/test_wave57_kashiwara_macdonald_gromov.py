"""
Unit & API Test Suite for SageAI Wave 57 Sovereign Defense Capabilities.
Capabilities 191-193 + Option B Wave 57:
- Capability 191: Kashiwara-Schapira Sheaves on Manifolds & Microlocal Defect Shield
- Capability 192: Macdonald Symmetric Polynomials & Double Affine Hecke Algebra (DAHA) Barrier
- Capability 193: Gromov-Eliashberg Symplectic Topology & Contact Non-Squeezing Firewall
- Option B Wave 57: Planetary F-Layer Inner-Core Slurry Stratification Supergrid
"""

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app
from app.services.kashiwara_schapira_microlocal_shield import (
    KashiwaraSchapiraMicrolocalShieldService,
    get_kashiwara_schapira_microlocal_shield_service,
)
from app.services.macdonald_daha_polynomial_barrier import (
    MacdonaldDAHAPolynomialBarrierService,
    get_macdonald_daha_polynomial_barrier_service,
)
from app.services.gromov_eliashberg_symplectic_firewall import (
    GromovEliashbergSymplecticFirewallService,
    get_gromov_eliashberg_symplectic_firewall_service,
)
from app.services.planetary_f_layer_slurry_supergrid import (
    PlanetaryFLayerSlurrySupergridService,
    get_planetary_f_layer_slurry_supergrid_service,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def auth_header():
    token = create_access_token({"sub": "test-operator", "role": "admin"})
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield
    client.headers.clear()


# =====================================================================
# Capability 191: Kashiwara-Schapira Sheaves & Microlocal Defect Shield
# =====================================================================

def test_kashiwara_microlocal_service_direct():
    svc = KashiwaraSchapiraMicrolocalShieldService()
    sheaves = svc.get_sheaves()
    assert len(sheaves) >= 3
    assert sheaves[0]["sheaf_id"] == "KS-COTANGENT-BUNDLE-01"

    # Evaluate microlocal support
    res = svc.evaluate_microlocal_support(
        sheaf_id="KS-COTANGENT-BUNDLE-01",
        cotangent_order=4,
        contact_gain=1.25,
        phase_cutoff=1e-4,
    )
    assert res["status"] == "MICROLOCAL_SUPPORT_INVOLUTIVE_LOCKED"
    assert res["involutive_verified"] is True
    assert res["ks_shield_strength_pev"] > 500.0
    assert res["cotangent_suppression_db"] > 195.0
    assert res["microlocal_residual"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_sheaves_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["microlocal_compliance_pct"] == 100.0


def test_kashiwara_microlocal_api_routes():
    # GET /sheaves
    r = client.get("/api/kashiwara-schapira-microlocal/sheaves")
    assert r.status_code == 200
    data = r.json()
    assert len(data["sheaves"]) >= 3

    # POST /evaluate-microlocal-support
    payload = {
        "sheaf_id": "KS-FUKAYA-WRAPPED-02",
        "cotangent_order": 4,
        "contact_gain": 1.25,
        "phase_cutoff": 1e-4,
    }
    r = client.post("/api/kashiwara-schapira-microlocal/evaluate-microlocal-support", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "MICROLOCAL_SUPPORT_INVOLUTIVE_LOCKED"
    assert res["involutive_verified"] is True

    # GET /metrics
    r = client.get("/api/kashiwara-schapira-microlocal/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["microlocal_compliance_pct"] == 100.0


# =====================================================================
# Capability 192: Macdonald DAHA Polynomial Barrier
# =====================================================================

def test_macdonald_daha_service_direct():
    svc = MacdonaldDAHAPolynomialBarrierService()
    algebras = svc.get_algebras()
    assert len(algebras) >= 3
    assert algebras[0]["algebra_id"] == "DAHA-GLN-ROOT-01"

    # Evaluate DAHA duality
    res = svc.evaluate_macdonald_duality(
        algebra_id="DAHA-GLN-ROOT-01",
        polynomial_degree=4,
        dunkl_order=6,
        barrier_gain=1.25,
    )
    assert res["status"] == "MACDONALD_DAHA_DUALITY_LOCKED"
    assert res["duality_verified"] is True
    assert res["daha_barrier_strength_pev"] > 500.0
    assert res["quantum_group_suppression_db"] > 195.0
    assert res["daha_duality_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_algebras_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["daha_duality_compliance_pct"] == 100.0


def test_macdonald_daha_api_routes():
    # GET /algebras
    r = client.get("/api/macdonald-daha-polynomial/algebras")
    assert r.status_code == 200
    data = r.json()
    assert len(data["algebras"]) >= 3

    # POST /evaluate-macdonald-duality
    payload = {
        "algebra_id": "DAHA-EXCEPTIONAL-E8-02",
        "polynomial_degree": 4,
        "dunkl_order": 6,
        "barrier_gain": 1.25,
    }
    r = client.post("/api/macdonald-daha-polynomial/evaluate-macdonald-duality", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "MACDONALD_DAHA_DUALITY_LOCKED"
    assert res["duality_verified"] is True

    # GET /metrics
    r = client.get("/api/macdonald-daha-polynomial/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["daha_duality_compliance_pct"] == 100.0


# =====================================================================
# Capability 193: Gromov-Eliashberg Symplectic Topology Firewall
# =====================================================================

def test_gromov_symplectic_service_direct():
    svc = GromovEliashbergSymplecticFirewallService()
    manifolds = svc.get_manifolds()
    assert len(manifolds) >= 3
    assert manifolds[0]["manifold_id"] == "GROMOV-CYLINDER-PHASE-01"

    # Evaluate symplectic capacity
    res = svc.evaluate_symplectic_capacity(
        manifold_id="GROMOV-CYLINDER-PHASE-01",
        ball_radius=1.0,
        cylinder_radius=1.0,
        firewall_gain=1.25,
    )
    assert res["status"] == "SYMPLECTIC_NON_SQUEEZING_LOCKED"
    assert res["non_squeezing_verified"] is True
    assert res["c0_rigidity_confirmed"] is True
    assert res["eliashberg_firewall_strength_pev"] > 500.0
    assert res["phase_space_suppression_db"] > 195.0
    assert res["capacity_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_manifolds_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["symplectic_rigidity_compliance_pct"] == 100.0


def test_gromov_symplectic_api_routes():
    # GET /manifolds
    r = client.get("/api/gromov-eliashberg-symplectic/manifolds")
    assert r.status_code == 200
    data = r.json()
    assert len(data["manifolds"]) >= 3

    # POST /evaluate-symplectic-capacity
    payload = {
        "manifold_id": "ELIASHBERG-TIGHT-CONTACT-02",
        "ball_radius": 1.2,
        "cylinder_radius": 1.25,
        "firewall_gain": 1.25,
    }
    r = client.post("/api/gromov-eliashberg-symplectic/evaluate-symplectic-capacity", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "SYMPLECTIC_NON_SQUEEZING_LOCKED"
    assert res["non_squeezing_verified"] is True

    # GET /metrics
    r = client.get("/api/gromov-eliashberg-symplectic/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["symplectic_rigidity_compliance_pct"] == 100.0


# =====================================================================
# Option B Wave 57: Planetary F-Layer Slurry Stratification Supergrid
# =====================================================================

def test_planetary_f_layer_slurry_service_direct():
    svc = PlanetaryFLayerSlurrySupergridService()
    arrays = svc.get_arrays()
    assert len(arrays) >= 3
    assert arrays[0]["array_id"] == "F-LAYER-PACIFIC-SEDIMENT-01"

    # Harvest F-layer slurry power
    res = svc.harvest_slurry_power(
        array_id="F-LAYER-PACIFIC-SEDIMENT-01",
        sedimentation_rate_override_mm_yr=2.5,
        magnetostrictive_efficiency=0.95,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "F_LAYER_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 7.0
    assert res["f_layer_depth_km"] == 4950.0
    assert res["grid_stability_pct"] >= 99.90
    assert res["slurry_phase"] == "STABLY_STRATIFIED_EPSILON_FE_SEDIMENT"

    metrics = svc.get_metrics()
    assert metrics["active_arrays_count"] >= 3
    assert metrics["harvest_events_total"] >= 1
    assert metrics["total_baseload_dispatch_gw"] >= 7.0
    assert metrics["f_layer_coupling_status"] == "F_LAYER_SLURRY_STRATIFICATION_LOCKED"


def test_planetary_f_layer_slurry_api_routes():
    # GET /arrays
    r = client.get("/api/planetary-f-layer-slurry-supergrid/arrays")
    assert r.status_code == 200
    data = r.json()
    assert len(data["arrays"]) >= 3

    # POST /harvest-slurry-power
    payload = {
        "array_id": "F-LAYER-ATLANTIC-STRATIFIED-02",
        "sedimentation_rate_override_mm_yr": 2.1,
        "magnetostrictive_efficiency": 0.95,
        "dispatch_duration_s": 60.0,
    }
    r = client.post("/api/planetary-f-layer-slurry-supergrid/harvest-slurry-power", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "F_LAYER_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 7.0

    # GET /metrics
    r = client.get("/api/planetary-f-layer-slurry-supergrid/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["f_layer_coupling_status"] == "F_LAYER_SLURRY_STRATIFICATION_LOCKED"


# =====================================================================
# Platform Health & Version 9.7.0 Verification
# =====================================================================

def test_wave57_health_and_integration():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["version"] in ("9.6.0", "9.7.0", "9.8.0", "9.9.0", "10.0.0", "10.1.0")
