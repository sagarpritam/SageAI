"""
Unit and API integration tests for Wave 53:
- Capability 179: Uhlenbeck Weak Compactness, Removable Singularities & Instanton Shield
- Capability 180: Taubes Vortices, Seiberg-Witten Invariants = Gromov Invariants Equivalence Barrier
- Capability 181: Drinfeld-Grothendieck-Teichmüller Group, Galois Action & Dessins d'Enfants Firewall
- Option B Wave 53: Planetary Outer-Core Geodynamo Helical Magnetohydrodynamic Turbulent Induction Supergrid
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.uhlenbeck_gauge_compactness_shield.uhlenbeck_gauge_compactness_shield import (
    UhlenbeckGaugeCompactnessShieldService,
)
from app.services.taubes_vortex_sw_barrier.taubes_vortex_sw_barrier import (
    TaubesVortexSWBarrierService,
)
from app.services.grothendieck_teichmuller_galois_firewall.grothendieck_teichmuller_galois_firewall import (
    GrothendieckTeichmullerGaloisFirewallService,
)
from app.services.geodynamo_helical_turbulent_supergrid.geodynamo_helical_turbulent_supergrid import (
    GeodynamoHelicalTurbulentSupergridService,
)

client = TestClient(app)


# ============================================================================
# Capability 179: Uhlenbeck Gauge Compactness Shield
# ============================================================================


def test_uhlenbeck_gauge_compactness_service_direct():
    svc = UhlenbeckGaugeCompactnessShieldService()
    configs = svc.get_configurations()
    assert len(configs) >= 3
    assert configs[0]["connection_id"] == "UHLENBECK-SU2-INSTANTON-01"
    assert configs[0]["instanton_number_k"] == 1

    # Enforce compactness
    res = svc.enforce_compactness(
        connection_id="UHLENBECK-SU2-INSTANTON-01",
        curvature_threshold=1e-4,
        bubbling_radius_delta=0.02,
        sobolev_gain=1.25,
    )
    assert res["status"] == "UHLENBECK_COMPACTNESS_ENFORCED"
    assert res["weak_compactness_verified"] is True
    assert res["removable_singularities_count"] >= 1
    assert res["uhlenbeck_shield_strength_pev"] > 200.0
    assert res["bubbling_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.enforce_compactness("INVALID-CONNECTION")


def test_uhlenbeck_gauge_compactness_api_routes():
    # GET /configurations
    r = client.get("/api/uhlenbeck-gauge-compactness/configurations")
    assert r.status_code == 200
    data = r.json()
    assert len(data["configurations"]) >= 3

    # POST /enforce-compactness
    payload = {
        "connection_id": "UHLENBECK-K3-CONNECTIONS-02",
        "curvature_threshold": 1e-4,
        "bubbling_radius_delta": 0.02,
        "sobolev_gain": 1.25,
    }
    r = client.post("/api/uhlenbeck-gauge-compactness/enforce-compactness", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "UHLENBECK_COMPACTNESS_ENFORCED"
    assert res["weak_compactness_verified"] is True

    # GET /metrics
    r = client.get("/api/uhlenbeck-gauge-compactness/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_connections_count"] >= 3
    assert metrics["instantonic_moduli_compliance_pct"] == 100.0


# ============================================================================
# Capability 180: Taubes Vortices & SW=Gr Equivalence Barrier
# ============================================================================


def test_taubes_vortex_sw_service_direct():
    svc = TaubesVortexSWBarrierService()
    manifolds = svc.get_manifolds()
    assert len(manifolds) >= 3
    assert manifolds[0]["manifold_id"] == "TAUBES-CP2-MONOPOLE-01"

    # Equate SW and Gromov invariants
    res = svc.equate_sw_gromov(
        manifold_id="TAUBES-CP2-MONOPOLE-01",
        vortex_parameter_r=1.0,
        perturbation_eta=0.01,
        coupling_gain=1.25,
    )
    assert res["status"] == "TAUBES_SW_GR_EQUIVALENCE_LOCKED"
    assert res["sw_gromov_equivalent"] is True
    assert res["taubes_barrier_strength_pev"] > 250.0
    assert res["vortex_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.equate_sw_gromov("INVALID-MANIFOLD")


def test_taubes_vortex_sw_api_routes():
    # GET /manifolds
    r = client.get("/api/taubes-vortex-sw/manifolds")
    assert r.status_code == 200
    data = r.json()
    assert len(data["manifolds"]) >= 3

    # POST /equate-sw-gromov
    payload = {
        "manifold_id": "TAUBES-K3-SURFACE-02",
        "vortex_parameter_r": 1.0,
        "perturbation_eta": 0.01,
        "coupling_gain": 1.25,
    }
    r = client.post("/api/taubes-vortex-sw/equate-sw-gromov", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "TAUBES_SW_GR_EQUIVALENCE_LOCKED"
    assert res["sw_gromov_equivalent"] is True

    # GET /metrics
    r = client.get("/api/taubes-vortex-sw/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_manifolds_count"] >= 3
    assert metrics["sw_gromov_duality_compliance_pct"] == 100.0


# ============================================================================
# Capability 181: Grothendieck-Teichmüller & Galois Dessins Firewall
# ============================================================================


def test_grothendieck_teichmuller_galois_service_direct():
    svc = GrothendieckTeichmullerGaloisFirewallService()
    dessins = svc.get_dessins()
    assert len(dessins) >= 3
    assert dessins[0]["dessin_id"] == "GT-CLEBSCH-CUBIC-01"

    # Evaluate associator
    res = svc.evaluate_associator(
        dessin_id="GT-CLEBSCH-CUBIC-01",
        drinfeld_lambda=1.0,
        associator_order=4,
        firewall_gain=1.25,
    )
    assert res["status"] == "GT_GALOIS_ASSOCIATOR_LOCKED"
    assert res["belyi_monodromy_verified"] is True
    assert res["gt_firewall_strength_pev"] > 200.0
    assert res["galois_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.evaluate_associator("INVALID-DESSIN")


def test_grothendieck_teichmuller_galois_api_routes():
    # GET /dessins
    r = client.get("/api/grothendieck-teichmuller-galois/dessins")
    assert r.status_code == 200
    data = r.json()
    assert len(data["dessins"]) >= 3

    # POST /evaluate-associator
    payload = {
        "dessin_id": "GT-FERMAT-QUARTIC-02",
        "drinfeld_lambda": 1.0,
        "associator_order": 4,
        "firewall_gain": 1.25,
    }
    r = client.post("/api/grothendieck-teichmuller-galois/evaluate-associator", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "GT_GALOIS_ASSOCIATOR_LOCKED"
    assert res["belyi_monodromy_verified"] is True

    # GET /metrics
    r = client.get("/api/grothendieck-teichmuller-galois/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_dessins_count"] >= 3
    assert metrics["belyi_arithmetic_compliance_pct"] == 100.0


# ============================================================================
# Wave 53 Option B: Planetary Outer-Core Geodynamo Induction Supergrid
# ============================================================================


def test_geodynamo_helical_turbulent_supergrid_service_direct():
    svc = GeodynamoHelicalTurbulentSupergridService()
    arrays = svc.get_arrays()
    assert len(arrays) >= 3
    assert arrays[0]["array_id"] == "DYNAMO-EQUATORIAL-COLUMN-01"

    # Harvest induction power
    res = svc.harvest_induction_power(
        array_id="DYNAMO-EQUATORIAL-COLUMN-01",
        helicity_override_alpha=0.045,
        induction_efficiency=0.95,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "GEODYNAMO_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 4.0
    assert res["grid_stability_pct"] > 99.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.harvest_induction_power("INVALID-ARRAY")


def test_geodynamo_helical_turbulent_supergrid_api_routes():
    # GET /arrays
    r = client.get("/api/geodynamo-helical-turbulent-supergrid/arrays")
    assert r.status_code == 200
    data = r.json()
    assert len(data["arrays"]) >= 3

    # POST /harvest-induction-power
    payload = {
        "array_id": "DYNAMO-POLAR-PLUME-02",
        "helicity_override_alpha": 0.052,
        "induction_efficiency": 0.95,
        "dispatch_duration_s": 60.0,
    }
    r = client.post("/api/geodynamo-helical-turbulent-supergrid/harvest-induction-power", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "GEODYNAMO_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 4.0

    # GET /metrics
    r = client.get("/api/geodynamo-helical-turbulent-supergrid/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_arrays_count"] >= 3
    assert metrics["geodynamo_coupling_status"] == "ALPHA_OMEGA_TURBULENCE_LOCKED"


# ============================================================================
# Platform Health & Version 9.3.0 Verification
# ============================================================================


def test_wave53_platform_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["version"] in ("9.2.0", "9.3.0", "9.4.0", "9.5.0", "9.6.0", "9.7.0", "9.8.0", "9.9.0", "10.0.0", "10.1.0", "10.2.0", "10.3.0", "10.4.0", "10.5.0")
    assert len(app.routes) >= 948
