"""
Unit & API Test Suite for SageAI Wave 62 Sovereign Defense Capabilities.
Capabilities 206-208 + Option B Wave 62 (v10.2.0):
- Capability 206: Hirzebruch-Riemann-Roch & Todd Genus Shield
- Capability 207: Weil Conjectures & Deligne Frobenius Purity Barrier
- Capability 208: Kontsevich Cyclic Homotopy & A-Infinity Formality Firewall
- Option B Wave 62: Planetary Magnetospheric Birkeland Current & Auroral Electrojet Supergrid
"""

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app
from app.services.hirzebruch_riemann_roch_todd_shield import (
    HirzebruchRiemannRochToddShieldService,
)
from app.services.weil_conjectures_frobenius_purity_barrier import (
    WeilConjecturesFrobeniusPurityBarrierService,
)
from app.services.kontsevich_cyclic_homotopy_firewall import (
    KontsevichCyclicHomotopyFirewallService,
)
from app.services.planetary_magnetospheric_birkeland_auroral_electrojet_supergrid import (
    PlanetaryMagnetosphericBirkelandAuroralElectrojetSupergridService,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def auth_header():
    token = create_access_token({"sub": "test-operator", "role": "admin"})
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield
    client.headers.clear()


def test_hirzebruch_todd_service_direct():
    svc = HirzebruchRiemannRochToddShieldService()
    sheaves = svc.get_sheaves()
    assert len(sheaves) >= 3
    assert sheaves[0]["sheaf_id"] == "HIRZEBRUCH-K3-TODD-01"

    res = svc.evaluate_hrr_todd_genus(
        sheaf_id="HIRZEBRUCH-K3-TODD-01",
        complex_dimension=2,
        bundle_rank=3,
        shield_gain=1.25,
    )
    assert res["status"] == "HIRZEBRUCH_HRR_TODD_LOCKED"
    assert res["todd_genus_verified"] is True
    assert res["hirzebruch_shield_strength_pev"] > 500.0
    assert res["holomorphic_anomaly_suppression_db"] > 195.0
    assert res["todd_intersection_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_sheaves_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["hrr_todd_compliance_pct"] == 100.0


def test_hirzebruch_todd_api_routes():
    r = client.get("/api/hirzebruch-riemann-roch/sheaves")
    assert r.status_code == 200
    assert len(r.json()["sheaves"]) >= 3

    r = client.post(
        "/api/hirzebruch-riemann-roch/evaluate-hrr-todd-genus",
        json={
            "sheaf_id": "HIRZEBRUCH-CALABI-YAU-3FOLD-02",
            "complex_dimension": 3,
            "bundle_rank": 4,
            "shield_gain": 1.25,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "HIRZEBRUCH_HRR_TODD_LOCKED"
    assert res["todd_genus_verified"] is True

    r = client.get("/api/hirzebruch-riemann-roch/metrics")
    assert r.status_code == 200
    assert r.json()["hrr_todd_compliance_pct"] == 100.0


def test_weil_purity_service_direct():
    svc = WeilConjecturesFrobeniusPurityBarrierService()
    varieties = svc.get_varieties()
    assert len(varieties) >= 3
    assert varieties[0]["variety_id"] == "WEIL-ELLIPTIC-CURVE-FQ-01"

    res = svc.evaluate_frobenius_purity(
        variety_id="WEIL-ELLIPTIC-CURVE-FQ-01",
        finite_field_q=7,
        cohomology_weight_w=1,
        barrier_gain=1.25,
    )
    assert res["status"] == "WEIL_FROBENIUS_PURITY_LOCKED"
    assert res["frobenius_purity_verified"] is True
    assert res["weil_barrier_strength_pev"] > 500.0
    assert res["zeta_pole_suppression_db"] > 195.0
    assert res["frobenius_purity_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_varieties_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["frobenius_purity_compliance_pct"] == 100.0


def test_weil_purity_api_routes():
    r = client.get("/api/weil-conjectures-purity/varieties")
    assert r.status_code == 200
    assert len(r.json()["varieties"]) >= 3

    r = client.post(
        "/api/weil-conjectures-purity/evaluate-frobenius-purity",
        json={
            "variety_id": "WEIL-DELIGNE-ABELIAN-SURFACE-02",
            "finite_field_q": 11,
            "cohomology_weight_w": 2,
            "barrier_gain": 1.25,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "WEIL_FROBENIUS_PURITY_LOCKED"
    assert res["frobenius_purity_verified"] is True

    r = client.get("/api/weil-conjectures-purity/metrics")
    assert r.status_code == 200
    assert r.json()["frobenius_purity_compliance_pct"] == 100.0


def test_cyclic_homotopy_service_direct():
    svc = KontsevichCyclicHomotopyFirewallService()
    algs = svc.get_algebras()
    assert len(algs) >= 3
    assert algs[0]["algebra_id"] == "CYCLIC-AINFINITY-HKR-01"

    res = svc.evaluate_cyclic_formality(
        algebra_id="CYCLIC-AINFINITY-HKR-01",
        arity_m_k=3,
        cyclic_degree=2,
        firewall_gain=1.25,
    )
    assert res["status"] == "CYCLIC_HOMOTOPY_FORMALITY_LOCKED"
    assert res["hkr_formality_verified"] is True
    assert res["cyclic_firewall_strength_pev"] > 500.0
    assert res["homotopy_obstruction_suppression_db"] > 195.0
    assert res["stasheff_ainfinity_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_algebras_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["cyclic_formality_compliance_pct"] == 100.0


def test_cyclic_homotopy_api_routes():
    r = client.get("/api/kontsevich-cyclic-homotopy/algebras")
    assert r.status_code == 200
    assert len(r.json()["algebras"]) >= 3

    r = client.post(
        "/api/kontsevich-cyclic-homotopy/evaluate-cyclic-formality",
        json={
            "algebra_id": "CYCLIC-DELIGNE-BRACKETS-02",
            "arity_m_k": 4,
            "cyclic_degree": 3,
            "firewall_gain": 1.25,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "CYCLIC_HOMOTOPY_FORMALITY_LOCKED"
    assert res["hkr_formality_verified"] is True

    r = client.get("/api/kontsevich-cyclic-homotopy/metrics")
    assert r.status_code == 200
    assert r.json()["cyclic_formality_compliance_pct"] == 100.0


def test_birkeland_electrojet_service_direct():
    svc = PlanetaryMagnetosphericBirkelandAuroralElectrojetSupergridService()
    jets = svc.get_electrojets()
    assert len(jets) >= 3
    assert jets[0]["electrojet_id"] == "BIRKELAND-REGION1-AURORAL-OVAL-01"

    res = svc.harvest_birkeland_electrojet_power(
        electrojet_id="BIRKELAND-REGION1-AURORAL-OVAL-01",
        current_multiplier_override=1.05,
        tether_efficiency=0.975,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "BIRKELAND_ELECTROJET_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 8.0
    assert res["ionospheric_flux_mw"] > 500.0
    assert res["grid_stability_pct"] > 99.0

    metrics = svc.get_metrics()
    assert metrics["active_electrojets_count"] >= 3
    assert metrics["harvest_events_total"] >= 1
    assert metrics["birkeland_coupling_status"] == "BIRKELAND_ELECTROJET_LOCKED"


def test_birkeland_electrojet_api_routes():
    r = client.get("/api/planetary-birkeland-auroral-electrojet/electrojets")
    assert r.status_code == 200
    assert len(r.json()["electrojets"]) >= 3

    r = client.post(
        "/api/planetary-birkeland-auroral-electrojet/harvest-birkeland-electrojet-power",
        json={
            "electrojet_id": "BIRKELAND-SUBSTORMS-WEDGE-03",
            "current_multiplier_override": 1.05,
            "tether_efficiency": 0.975,
            "dispatch_duration_s": 60.0,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "BIRKELAND_ELECTROJET_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 7.5

    r = client.get("/api/planetary-birkeland-auroral-electrojet/metrics")
    assert r.status_code == 200
    assert r.json()["birkeland_coupling_status"] == "BIRKELAND_ELECTROJET_LOCKED"


def test_wave62_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["version"] in ("10.1.0", "10.2.0", "10.3.0", "10.4.0", "10.5.0")
    assert data["status"] in ("healthy", "degraded")
