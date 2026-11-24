"""
Unit and API integration tests for Wave 48:
- Capability 164: G_2 Holonomy Octonionic Instanton Shield & Associative 3-Cycle Calibrations
- Capability 165: Derived Azumaya Brauer-Grothendieck Shield & Non-Commutative Motives
- Capability 166: Conformal Boundary CFT Cardy State Shield & Verlinde Fusion Firewall
- Option B Wave 48: Planetary Room-Temperature LK-99 & Hydride Megabar Supergrid
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.azumaya_brauer_shield.azumaya_brauer_shield import (
    AzumayaBrauerShieldService,
)
from app.services.cardy_boundary_cft.cardy_boundary_cft import (
    CardyBoundaryCFTService,
)
from app.services.g2_octonionic_shield.g2_octonionic_shield import (
    G2OctonionicShieldService,
)
from app.services.hydride_megabar_supergrid.hydride_megabar_supergrid import (
    HydrideMegabarSupergridService,
)

client = TestClient(app)


# ============================================================================
# Capability 164: G_2 Octonionic Instanton Shield
# ============================================================================


def test_g2_octonionic_service_direct():
    svc = G2OctonionicShieldService()
    manifolds = svc.get_manifolds()
    assert len(manifolds) >= 3
    assert manifolds[0]["manifold_id"] == "G2-JOYCE-TORUS-01"
    assert manifolds[0]["betti_b3"] == 7

    # Valid calibration
    res = svc.calibrate_associative(
        manifold_id="G2-JOYCE-TORUS-01",
        instanton_charge=3,
        torsion_free_precision=1e-6,
        associative_refinement_depth=8,
        calibration_gain=1.2,
    )
    assert res["status"] == "OCTONIONIC_INSTANTON_CALIBRATED"
    assert res["associative_calibration_fidelity_pct"] > 99.99
    assert res["octonionic_shield_suppression_db"] > 150.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown G_2 manifold ID"):
        svc.calibrate_associative("INVALID-MANIFOLD")
    with pytest.raises(ValueError, match="instanton_charge must be between"):
        svc.calibrate_associative("G2-JOYCE-TORUS-01", instanton_charge=99)
    with pytest.raises(ValueError, match="associative_refinement_depth must be"):
        svc.calibrate_associative("G2-JOYCE-TORUS-01", associative_refinement_depth=64)


def test_g2_octonionic_api_routes():
    # GET manifolds
    r1 = client.get("/api/g2-octonionic-shield/manifolds")
    assert r1.status_code == 200
    assert len(r1.json()["manifolds"]) >= 3

    # POST calibrate-associative
    payload = {
        "manifold_id": "G2-JOYCE-TORUS-01",
        "instanton_charge": 4,
        "torsion_free_precision": 1e-6,
        "associative_refinement_depth": 8,
        "calibration_gain": 1.1,
    }
    r2 = client.post("/api/g2-octonionic-shield/calibrate-associative", json=payload)
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["status"] == "OCTONIONIC_INSTANTON_CALIBRATED"
    assert d2["instanton_charge"] == 4

    # GET metrics
    r3 = client.get("/api/g2-octonionic-shield/metrics")
    assert r3.status_code == 200
    assert r3.json()["total_g2_manifolds"] >= 3


# ============================================================================
# Capability 165: Derived Azumaya Brauer-Grothendieck Shield
# ============================================================================


def test_azumaya_brauer_service_direct():
    svc = AzumayaBrauerShieldService()
    algebras = svc.get_algebras()
    assert len(algebras) >= 3
    assert algebras[0]["algebra_id"] == "AZUMAYA-K3-TWISTED-01"

    # Valid seal
    res = svc.seal_brauer(
        algebra_id="AZUMAYA-K3-TWISTED-01",
        torsion_order_n=4,
        periodic_cyclic_degree=2,
        morita_equivalence_depth=8,
        brauer_amplification=1.2,
    )
    assert res["status"] == "AZUMAYA_BRAUER_SEALED"
    assert res["morita_fidelity_pct"] > 99.99
    assert res["noncommutative_barrier_db"] > 160.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown Azumaya algebra ID"):
        svc.seal_brauer("INVALID-ALGEBRA")
    with pytest.raises(ValueError, match="torsion_order_n must be between"):
        svc.seal_brauer("AZUMAYA-K3-TWISTED-01", torsion_order_n=100)
    with pytest.raises(ValueError, match="morita_equivalence_depth must be"):
        svc.seal_brauer("AZUMAYA-K3-TWISTED-01", morita_equivalence_depth=50)


def test_azumaya_brauer_api_routes():
    # GET algebras
    r1 = client.get("/api/azumaya-brauer-shield/algebras")
    assert r1.status_code == 200
    assert len(r1.json()["algebras"]) >= 3

    # POST seal-brauer
    payload = {
        "algebra_id": "AZUMAYA-CALABI-YAU-02",
        "torsion_order_n": 4,
        "periodic_cyclic_degree": 2,
        "morita_equivalence_depth": 10,
        "brauer_amplification": 1.0,
    }
    r2 = client.post("/api/azumaya-brauer-shield/seal-brauer", json=payload)
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["status"] == "AZUMAYA_BRAUER_SEALED"
    assert d2["algebra_id"] == "AZUMAYA-CALABI-YAU-02"

    # GET metrics
    r3 = client.get("/api/azumaya-brauer-shield/metrics")
    assert r3.status_code == 200
    assert r3.json()["total_azumaya_algebras"] >= 3


# ============================================================================
# Capability 166: Cardy Boundary CFT Shield
# ============================================================================


def test_cardy_boundary_service_direct():
    svc = CardyBoundaryCFTService()
    states = svc.get_states()
    assert len(states) >= 3
    assert states[0]["state_id"] == "CARDY-ISING-FREE-01"

    # Valid seal
    res = svc.seal_boundary(
        state_id="CARDY-ISING-FREE-01",
        modular_s_parameter=0.7071,
        verlinde_fusion_level_k=4,
        boundary_defect_charge=1.0,
        conformal_gain=1.2,
    )
    assert res["status"] == "CARDY_BOUNDARY_SEALED"
    assert res["boundary_conformal_fidelity_pct"] > 99.99
    assert res["boundary_edge_suppression_db"] > 150.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown Cardy state ID"):
        svc.seal_boundary("INVALID-STATE")
    with pytest.raises(ValueError, match="verlinde_fusion_level_k must be"):
        svc.seal_boundary("CARDY-ISING-FREE-01", verlinde_fusion_level_k=50)


def test_cardy_boundary_api_routes():
    # GET states
    r1 = client.get("/api/cardy-boundary-cft/states")
    assert r1.status_code == 200
    assert len(r1.json()["states"]) >= 3

    # POST seal-boundary
    payload = {
        "state_id": "CARDY-WZW-SU2-02",
        "modular_s_parameter": 0.5,
        "verlinde_fusion_level_k": 4,
        "boundary_defect_charge": 1.0,
        "conformal_gain": 1.1,
    }
    r2 = client.post("/api/cardy-boundary-cft/seal-boundary", json=payload)
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["status"] == "CARDY_BOUNDARY_SEALED"
    assert d2["state_id"] == "CARDY-WZW-SU2-02"

    # GET metrics
    r3 = client.get("/api/cardy-boundary-cft/metrics")
    assert r3.status_code == 200
    assert r3.json()["total_cardy_states"] >= 3


# ============================================================================
# Option B Wave 48: Hydride Megabar Supergrid
# ============================================================================


def test_hydride_megabar_service_direct():
    svc = HydrideMegabarSupergridService()
    vaults = svc.get_vaults()
    assert len(vaults) >= 3
    assert vaults[0]["vault_id"] == "MEGABAR-LAH10-VAULT-01"

    # Valid harvest
    res = svc.harvest_megabar(
        vault_id="MEGABAR-LAH10-VAULT-01",
        megabar_pressure_gpa=175.0,
        phonon_coupling_alpha2f=2.8,
        rectification_gain=1.2,
    )
    assert res["status"] == "HYDRIDE_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 500.0
    assert res["conversion_efficiency_pct"] > 99.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown hydride vault ID"):
        svc.harvest_megabar("INVALID-VAULT")
    with pytest.raises(ValueError, match="megabar_pressure_gpa must be between"):
        svc.harvest_megabar("MEGABAR-LAH10-VAULT-01", megabar_pressure_gpa=999.0)


def test_hydride_megabar_api_routes():
    # GET vaults
    r1 = client.get("/api/hydride-megabar-supergrid/vaults")
    assert r1.status_code == 200
    assert len(r1.json()["vaults"]) >= 3

    # POST harvest-megabar
    payload = {
        "vault_id": "LUNH-NITROGEN-TRUNK-02",
        "megabar_pressure_gpa": 1.2,
        "phonon_coupling_alpha2f": 1.9,
        "rectification_gain": 1.0,
    }
    r2 = client.post("/api/hydride-megabar-supergrid/harvest-megabar", json=payload)
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["status"] == "HYDRIDE_POWER_DISPATCHED"
    assert d2["vault_id"] == "LUNH-NITROGEN-TRUNK-02"

    # GET metrics
    r3 = client.get("/api/hydride-megabar-supergrid/metrics")
    assert r3.status_code == 200
    assert r3.json()["total_vaults"] >= 3


# ============================================================================
# Platform Health Probe v8.8.0
# ============================================================================


def test_wave48_platform_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["version"] in ("8.8.0", "8.9.0", "9.0.0")
