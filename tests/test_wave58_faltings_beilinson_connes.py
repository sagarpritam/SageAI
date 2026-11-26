"""
Unit & API Test Suite for SageAI Wave 58 Sovereign Defense Capabilities.
Capabilities 194-196 + Option B Wave 58:
- Capability 194: Faltings p-Adic Hodge Theory & Almost Étale Extensions Shield
- Capability 195: Beilinson-Bernstein Localization & Flag Variety D-Modules Barrier
- Capability 196: Connes-Kreimer Hopf Algebra of Renormalization & Rooted Trees Firewall
- Option B Wave 58: Planetary Outer-Core Tangent Cylinder Jet Supergrid
"""

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app
from app.services.faltings_almost_etale_shield import (
    FaltingsAlmostEtaleShieldService,
    get_faltings_almost_etale_shield_service,
)
from app.services.beilinson_bernstein_localization_barrier import (
    BeilinsonBernsteinLocalizationBarrierService,
    get_beilinson_bernstein_localization_barrier_service,
)
from app.services.connes_kreimer_hopf_firewall import (
    ConnesKreimerHopfRenormalizationFirewallService,
    get_connes_kreimer_hopf_firewall_service,
)
from app.services.planetary_outer_core_tangent_cylinder_jet_supergrid import (
    PlanetaryOuterCoreTangentCylinderJetSupergridService,
    get_planetary_outer_core_tangent_cylinder_jet_supergrid_service,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def auth_header():
    token = create_access_token({"sub": "test-operator", "role": "admin"})
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield
    client.headers.clear()


# =====================================================================
# Capability 194: Faltings Almost Étale & Fontaine Period Ring Shield
# =====================================================================

def test_faltings_almost_etale_service_direct():
    svc = FaltingsAlmostEtaleShieldService()
    schemes = svc.get_schemes()
    assert len(schemes) >= 3
    assert schemes[0]["scheme_id"] == "FALTINGS-PADIC-CURVE-01"

    # Evaluate almost étale descent
    res = svc.evaluate_almost_etale_descent(
        scheme_id="FALTINGS-PADIC-CURVE-01",
        p_prime=5,
        truncation_degree=4,
        shield_gain=1.25,
    )
    assert res["status"] == "ALMOST_ETALE_DESCENT_ENFORCED"
    assert res["almost_etale_verified"] is True
    assert res["faltings_shield_strength_pev"] > 500.0
    assert res["galois_suppression_db"] > 195.0
    assert res["almost_etale_residual"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_schemes_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["almost_etale_compliance_pct"] == 100.0


def test_faltings_almost_etale_api_routes():
    # GET /schemes
    r = client.get("/api/faltings-almost-etale/schemes")
    assert r.status_code == 200
    data = r.json()
    assert len(data["schemes"]) >= 3

    # POST /evaluate-almost-etale-descent
    payload = {
        "scheme_id": "FONTAINE-CRYS-SURFACE-02",
        "p_prime": 7,
        "truncation_degree": 6,
        "shield_gain": 1.25,
    }
    r = client.post("/api/faltings-almost-etale/evaluate-almost-etale-descent", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "ALMOST_ETALE_DESCENT_ENFORCED"
    assert res["almost_etale_verified"] is True

    # GET /metrics
    r = client.get("/api/faltings-almost-etale/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["almost_etale_compliance_pct"] == 100.0


# =====================================================================
# Capability 195: Beilinson-Bernstein Localization Barrier
# =====================================================================

def test_beilinson_bernstein_service_direct():
    svc = BeilinsonBernsteinLocalizationBarrierService()
    algebras = svc.get_algebras()
    assert len(algebras) >= 3
    assert algebras[0]["variety_id"] == "BB-SL2-FLAG-01"

    # Evaluate D-module localization
    res = svc.evaluate_d_module_localization(
        variety_id="BB-SL2-FLAG-01",
        flag_dimension=1,
        twisted_lambda=1.0,
        barrier_gain=1.25,
    )
    assert res["status"] == "BEILINSON_BERNSTEIN_LOCALIZATION_LOCKED"
    assert res["holonomic_verified"] is True
    assert res["beilinson_barrier_strength_pev"] > 500.0
    assert res["differential_suppression_db"] > 195.0
    assert res["localization_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_varieties_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["beilinson_localization_compliance_pct"] == 100.0


def test_beilinson_bernstein_api_routes():
    # GET /algebras
    r = client.get("/api/beilinson-bernstein-localization/algebras")
    assert r.status_code == 200
    data = r.json()
    assert len(data["algebras"]) >= 3

    # POST /evaluate-d-module-localization
    payload = {
        "variety_id": "BB-SL3-COMPLETE-FLAG-02",
        "flag_dimension": 3,
        "twisted_lambda": 1.5,
        "barrier_gain": 1.25,
    }
    r = client.post("/api/beilinson-bernstein-localization/evaluate-d-module-localization", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "BEILINSON_BERNSTEIN_LOCALIZATION_LOCKED"
    assert res["holonomic_verified"] is True

    # GET /metrics
    r = client.get("/api/beilinson-bernstein-localization/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["beilinson_localization_compliance_pct"] == 100.0


# =====================================================================
# Capability 196: Connes-Kreimer Hopf Renormalization Firewall
# =====================================================================

def test_connes_kreimer_service_direct():
    svc = ConnesKreimerHopfRenormalizationFirewallService()
    graphs = svc.get_graphs()
    assert len(graphs) >= 3
    assert graphs[0]["graph_id"] == "CK-PHI4-TWO-LOOP-01"

    # Evaluate Birkhoff decomposition
    res = svc.evaluate_birkhoff_decomposition(
        graph_id="CK-PHI4-TWO-LOOP-01",
        loop_order=2,
        dimensional_epsilon=0.01,
        firewall_gain=1.25,
    )
    assert res["status"] == "CONNES_KREIMER_BIRKHOFF_LOCKED"
    assert res["antipode_verified"] is True
    assert res["connes_firewall_strength_pev"] > 500.0
    assert res["uv_subdivergence_suppression_db"] > 195.0
    assert res["birkhoff_decomposition_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_graphs_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["birkhoff_hopf_compliance_pct"] == 100.0


def test_connes_kreimer_api_routes():
    # GET /graphs
    r = client.get("/api/connes-kreimer-hopf/graphs")
    assert r.status_code == 200
    data = r.json()
    assert len(data["graphs"]) >= 3

    # POST /evaluate-birkhoff-decomposition
    payload = {
        "graph_id": "CK-QED-VERTEX-CORRECTION-02",
        "loop_order": 3,
        "dimensional_epsilon": 0.01,
        "firewall_gain": 1.25,
    }
    r = client.post("/api/connes-kreimer-hopf/evaluate-birkhoff-decomposition", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "CONNES_KREIMER_BIRKHOFF_LOCKED"
    assert res["antipode_verified"] is True

    # GET /metrics
    r = client.get("/api/connes-kreimer-hopf/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["birkhoff_hopf_compliance_pct"] == 100.0


# =====================================================================
# Option B Wave 58: Planetary Outer-Core Tangent Cylinder Jet Supergrid
# =====================================================================

def test_planetary_tangent_cylinder_service_direct():
    svc = PlanetaryOuterCoreTangentCylinderJetSupergridService()
    arrays = svc.get_arrays()
    assert len(arrays) >= 3
    assert arrays[0]["array_id"] == "TC-NORTHERN-ARCTIC-JET-01"

    # Harvest tangent jet power
    res = svc.harvest_tangent_jet_power(
        array_id="TC-NORTHERN-ARCTIC-JET-01",
        jet_velocity_override_km_yr=42.5,
        mhd_induction_efficiency=0.95,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "TANGENT_CYLINDER_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 7.0
    assert res["tangent_jet_flux_mw"] > 400.0
    assert res["grid_stability_pct"] > 99.0

    metrics = svc.get_metrics()
    assert metrics["active_arrays_count"] >= 3
    assert metrics["harvest_events_total"] >= 1
    assert metrics["tangent_cylinder_coupling_status"] == "OUTER_CORE_TANGENT_CYLINDER_JET_LOCKED"


def test_planetary_tangent_cylinder_api_routes():
    # GET /arrays
    r = client.get("/api/planetary-outer-core-tangent-cylinder-jet/arrays")
    assert r.status_code == 200
    data = r.json()
    assert len(data["arrays"]) >= 3

    # POST /harvest-tangent-jet-power
    payload = {
        "array_id": "TC-EQUATORIAL-CYLINDER-TANGENT-03",
        "jet_velocity_override_km_yr": 44.1,
        "mhd_induction_efficiency": 0.95,
        "dispatch_duration_s": 60.0,
    }
    r = client.post("/api/planetary-outer-core-tangent-cylinder-jet/harvest-tangent-jet-power", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "TANGENT_CYLINDER_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 7.0

    # GET /metrics
    r = client.get("/api/planetary-outer-core-tangent-cylinder-jet/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["tangent_cylinder_coupling_status"] == "OUTER_CORE_TANGENT_CYLINDER_JET_LOCKED"


# =====================================================================
# Wave 58 Root Health & Capability Integrity Check
# =====================================================================

def test_wave58_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["version"] in ("9.7.0", "9.8.0", "9.9.0", "10.0.0", "10.1.0", "10.2.0", "10.3.0", "10.4.0", "10.5.0", "10.6.0", "10.7.0", "10.8.0", "10.9.0", "11.0.0")
    assert data["status"] in ("healthy", "degraded")
