"""
Unit and API integration tests for Wave 47:
- Capability 161: Fibonacci Anyon Braiding & Topological Fusion Shield
- Capability 162: BGG Category O Shield & Verma Module Invariants
- Capability 163: 15 mK Cryogenic Flux Qubit & Phase Slip Clamping
- Option B Wave 47: 2e^2/h Conductance Peak Energy Harvesting & Majorana Supergrid
- Executive Pitch Deck Metrics Suite (/api/deck/metrics)
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.bgg_category_o_shield.bgg_category_o_shield import (
    BggCategoryOShieldService,
)
from app.services.cryogenic_flux_qubit.cryogenic_flux_qubit import (
    CryogenicFluxQubitService,
)
from app.services.fibonacci_anyon_braiding.fibonacci_anyon_braiding import (
    FibonacciAnyonBraidingService,
)
from app.services.majorana_supergrid_power.majorana_supergrid_power import (
    MajoranaSupergridPowerService,
)

client = TestClient(app)


# ============================================================================
# Capability 161: Fibonacci Anyon Braiding & Topological Fusion
# ============================================================================


def test_fibonacci_anyon_service_direct():
    svc = FibonacciAnyonBraidingService()
    braids = svc.get_braids()
    assert len(braids) >= 3
    assert braids[0]["braid_id"] == "ANYON-FIB-4STRAND-01"
    assert braids[0]["quantum_dimension"] == pytest.approx(1.618034, rel=1e-4)

    # Valid execution
    res = svc.execute_braid(
        braid_id="ANYON-FIB-4STRAND-01",
        generator_index=2,
        braid_turns=8,
        topological_order_k=5,
        braid_gain=1.2,
    )
    assert res["status"] == "ANYON_BRAID_EXECUTED"
    assert res["fault_tolerant_unitary"] is True
    assert res["topological_fidelity_pct"] > 99.99
    assert res["unitary_determinant"] == 1.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown Fibonacci braid ID"):
        svc.execute_braid("INVALID-BRAID")
    with pytest.raises(ValueError, match="generator_index must be between"):
        svc.execute_braid("ANYON-FIB-4STRAND-01", generator_index=99)
    with pytest.raises(ValueError, match="braid_turns must be between"):
        svc.execute_braid("ANYON-FIB-4STRAND-01", braid_turns=0)


def test_fibonacci_anyon_api_routes():
    # GET list
    res = client.get("/api/fibonacci-anyon-braiding/braids")
    assert res.status_code == 200
    data = res.json()
    assert "braids" in data
    assert len(data["braids"]) >= 3

    # POST execute
    exec_res = client.post(
        "/api/fibonacci-anyon-braiding/execute-braid",
        json={
            "braid_id": "ANYON-FIB-4STRAND-01",
            "generator_index": 2,
            "braid_turns": 8,
            "topological_order_k": 5,
            "braid_gain": 1.2,
        },
    )
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert exec_data["status"] == "ANYON_BRAID_EXECUTED"
    assert exec_data["fault_tolerant_unitary"] is True
    assert exec_data["topological_fidelity_pct"] > 99.99

    # GET metrics
    metrics_res = client.get("/api/fibonacci-anyon-braiding/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["universal_quantum_computing"] is True


# ============================================================================
# Capability 162: BGG Category O Shield & Verma Module Invariants
# ============================================================================


def test_bgg_category_o_service_direct():
    svc = BggCategoryOShieldService()
    modules = svc.get_modules()
    assert len(modules) >= 3
    assert modules[0]["module_id"] == "BGG-SL2-PRINCIPAL-01"

    # Valid seal
    res = svc.seal_verma(
        module_id="BGG-SL2-PRINCIPAL-01",
        weyl_length=4,
        polynomial_deg_q=2,
        filtration_steps=8,
        kl_amplification=1.0,
    )
    assert res["status"] == "VERMA_MODULE_SEALED"
    assert res["verma_module_shielded"] is True
    assert res["bgg_reciprocity_fidelity_pct"] > 99.99
    assert res["representation_barrier_db"] > 165.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown Category O module ID"):
        svc.seal_verma("INVALID-MODULE")
    with pytest.raises(ValueError, match="weyl_length must be between"):
        svc.seal_verma("BGG-SL2-PRINCIPAL-01", weyl_length=0)
    with pytest.raises(ValueError, match="filtration_steps must be between"):
        svc.seal_verma("BGG-SL2-PRINCIPAL-01", filtration_steps=99)


def test_bgg_category_o_api_routes():
    # GET list
    res = client.get("/api/bgg-category-o-shield/modules")
    assert res.status_code == 200
    data = res.json()
    assert "modules" in data
    assert len(data["modules"]) >= 3

    # POST seal
    seal_res = client.post(
        "/api/bgg-category-o-shield/seal-verma",
        json={
            "module_id": "BGG-SL2-PRINCIPAL-01",
            "weyl_length": 4,
            "polynomial_deg_q": 2,
            "filtration_steps": 8,
            "kl_amplification": 1.0,
        },
    )
    assert seal_res.status_code == 200
    seal_data = seal_res.json()
    assert seal_data["status"] == "VERMA_MODULE_SEALED"
    assert seal_data["verma_module_shielded"] is True

    # GET metrics
    metrics_res = client.get("/api/bgg-category-o-shield/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["highest_weight_symmetry_locked"] is True


# ============================================================================
# Capability 163: 15 mK Cryogenic Flux Qubit & Phase Slip Clamping
# ============================================================================


def test_cryogenic_flux_qubit_service_direct():
    svc = CryogenicFluxQubitService()
    qubits = svc.get_qubits()
    assert len(qubits) >= 3
    assert qubits[0]["qubit_id"] == "CRYO-FLUX-15MK-01"

    # Valid clamp
    res = svc.clamp_phase_slip(
        qubit_id="CRYO-FLUX-15MK-01",
        magnetic_flux_bias_phi0=0.5,
        microwave_attenuation_db=60.0,
        pump_frequency_ghz=6.45,
        superconducting_gain=1.2,
    )
    assert res["status"] == "PHASE_SLIP_CLAMPED"
    assert res["quantum_phase_slip_clamped"] is True
    assert res["sweet_spot_offset"] == 0.0
    assert res["thermal_photon_attenuation_db"] > 100.0

    # Validation errors
    with pytest.raises(ValueError, match="Unknown cryogenic flux qubit ID"):
        svc.clamp_phase_slip("INVALID-QUBIT")
    with pytest.raises(ValueError, match="magnetic_flux_bias_phi0 must be between"):
        svc.clamp_phase_slip("CRYO-FLUX-15MK-01", magnetic_flux_bias_phi0=1.5)
    with pytest.raises(ValueError, match="microwave_attenuation_db must be between"):
        svc.clamp_phase_slip("CRYO-FLUX-15MK-01", microwave_attenuation_db=5.0)


def test_cryogenic_flux_qubit_api_routes():
    # GET list
    res = client.get("/api/cryogenic-flux-qubit/qubits")
    assert res.status_code == 200
    data = res.json()
    assert "qubits" in data
    assert len(data["qubits"]) >= 3

    # POST clamp
    clamp_res = client.post(
        "/api/cryogenic-flux-qubit/clamp-phase-slip",
        json={
            "qubit_id": "CRYO-FLUX-15MK-01",
            "magnetic_flux_bias_phi0": 0.5,
            "microwave_attenuation_db": 60.0,
            "pump_frequency_ghz": 6.45,
            "superconducting_gain": 1.2,
        },
    )
    assert clamp_res.status_code == 200
    clamp_data = clamp_res.json()
    assert clamp_data["status"] == "PHASE_SLIP_CLAMPED"
    assert clamp_data["quantum_phase_slip_clamped"] is True

    # GET metrics
    metrics_res = client.get("/api/cryogenic-flux-qubit/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["phase_slip_suppression_active"] is True


# ============================================================================
# Option B Wave 47: 2e^2/h Conductance Peak Energy Harvesting & Majorana Power
# ============================================================================


def test_majorana_supergrid_power_service_direct():
    svc = MajoranaSupergridPowerService()
    arrays = svc.get_arrays()
    assert len(arrays) >= 3
    assert arrays[0]["array_id"] == "MZM-KODIAK-INAS-01"

    # Valid harvest
    res = svc.harvest_majorana(
        array_id="MZM-KODIAK-INAS-01",
        zeeman_field_tesla=1.5,
        chemical_potential_mu_mev=0.5,
        supercurrent_bias_ma=4.2,
        grid_gain=1.0,
    )
    assert res["grid_stabilization_status"] == "MAJORANA_ZERO_MODE_HARVESTED"
    assert res["quantized_conductance_g0"] == "2e^2/h"
    assert res["harvested_power_mw"] > 8000.0
    assert res["topological_criterion_met"] is True

    # Validation errors
    with pytest.raises(ValueError, match="Unknown Majorana array ID"):
        svc.harvest_majorana("INVALID-ARRAY")
    with pytest.raises(ValueError, match="zeeman_field_tesla must be between"):
        svc.harvest_majorana("MZM-KODIAK-INAS-01", zeeman_field_tesla=0.01)
    with pytest.raises(ValueError, match="grid_gain must be between"):
        svc.harvest_majorana("MZM-KODIAK-INAS-01", grid_gain=0.1)


def test_majorana_supergrid_power_api_routes():
    # GET list
    res = client.get("/api/majorana-supergrid-power/arrays")
    assert res.status_code == 200
    data = res.json()
    assert "arrays" in data
    assert len(data["arrays"]) >= 3

    # POST harvest
    harvest_res = client.post(
        "/api/majorana-supergrid-power/harvest-majorana",
        json={
            "array_id": "MZM-KODIAK-INAS-01",
            "zeeman_field_tesla": 1.5,
            "chemical_potential_mu_mev": 0.5,
            "supercurrent_bias_ma": 4.2,
            "grid_gain": 1.0,
        },
    )
    assert harvest_res.status_code == 200
    harvest_data = harvest_res.json()
    assert harvest_data["grid_stabilization_status"] == "MAJORANA_ZERO_MODE_HARVESTED"
    assert harvest_data["quantized_conductance_g0"] == "2e^2/h"
    assert harvest_data["harvested_power_mw"] > 8000.0

    # GET metrics
    metrics_res = client.get("/api/majorana-supergrid-power/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fossil_carbon"] is True


# ============================================================================
# Executive Pitch Deck Metrics Suite (/api/deck/metrics)
# ============================================================================


def test_deck_metrics_route():
    res = client.get("/api/deck/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["pipeline_arr_usd"] == "$840,000 ARR"
    assert data["gross_margin_pct"] >= 90.0
    assert len(data["enterprise_logos"]) == 4
    assert data["status"] == "DECK_METRICS_OPTIMAL"
