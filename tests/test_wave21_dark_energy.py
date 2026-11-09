"""
Unit & Integration Tests for Wave 21 Dark Energy & Quantum Vacuum Milestone (Capabilities 83-85)
and Option B Sovereign Quantum Key Distribution Space-Mesh Interstellar Relay Engine.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.dark_energy_harvester import (
    dark_energy_harvester,
    DarkEnergyQuintessenceHarvester,
)
from app.services.casimir_vacuum_harvester import (
    casimir_vacuum_harvester,
    DynamicCasimirVacuumHarvester,
)
from app.services.anyon_topological_braiding import (
    anyon_topological_braiding,
    TopologicalAnyonBraidingMatrix,
)
from app.services.qkd_space_mesh_relay import (
    qkd_space_mesh_relay,
    SovereignQKDSpaceMeshRelay,
)

client = TestClient(app)


# ---------------------------------------------------------
# Capability 83: Dark Energy Quintessence & Inflaton Harvester
# ---------------------------------------------------------
def test_dark_energy_harvester_service():
    harvesters = dark_energy_harvester.list_harvesters()
    assert len(harvesters) >= 3
    ids = [h["harvester_id"] for h in harvesters]
    assert "DARK-ENERGY-ATACAMA-01" in ids
    assert "DARK-ENERGY-ORBITAL-LAGRANGE-03" in ids

    # Stabilize inflaton field
    event = dark_energy_harvester.stabilize_inflaton_field(
        harvester_id="DARK-ENERGY-ATACAMA-01",
        target_metric_region="LOCAL_SOLAR_WARP_SECTOR_4",
        coupling_factor=1.2,
    )
    assert event["event_id"].startswith("DARK-ENERGY-STAB-")
    assert event["equation_of_state_w"] < -1.0  # Must be phantom/quintessence negative pressure
    assert event["negative_pressure_clamped_gpa"] < 0.0
    assert event["metric_energy_yield_mw"] > 0.0
    assert event["curvature_stability_index"] > 99.0
    assert event["status"] == "NEGATIVE_PRESSURE_METRIC_HARVEST_OPTIMAL"

    # Metrics
    metrics = dark_energy_harvester.get_harvest_metrics()
    assert metrics["active_quintessence_harvesters"] >= 3
    assert metrics["total_harvest_rate_mw"] > 1000.0
    assert metrics["status"] == "OPERATIONAL"

    # Validation failure
    with pytest.raises(ValueError):
        dark_energy_harvester.stabilize_inflaton_field(
            harvester_id="INVALID-HARVESTER-999"
        )


def test_dark_energy_api():
    # GET harvesters
    res = client.get("/api/dark-energy/harvesters")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3

    # POST stabilize-field
    res_stab = client.post(
        "/api/dark-energy/stabilize-field",
        json={
            "harvester_id": "DARK-ENERGY-MAUNA-KEA-02",
            "target_metric_region": "CRUSTAL_EQUILIBRIUM_SECTOR",
            "coupling_factor": 1.0,
        },
    )
    assert res_stab.status_code == 200
    stab_data = res_stab.json()
    assert stab_data["equation_of_state_w"] < -1.0

    # POST invalid harvester -> 400
    res_err = client.post(
        "/api/dark-energy/stabilize-field",
        json={
            "harvester_id": "UNKNOWN-HARVESTER",
        },
    )
    assert res_err.status_code == 400

    # GET metrics
    res_met = client.get("/api/dark-energy/metrics")
    assert res_met.status_code == 200
    assert res_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------
# Capability 84: Dynamic Casimir Relativistic Vacuum Harvester
# ---------------------------------------------------------
def test_casimir_vacuum_harvester_service():
    resonators = casimir_vacuum_harvester.list_resonators()
    assert len(resonators) >= 3
    ids = [r["resonator_id"] for r in resonators]
    assert "CASIMIR-CAVITY-DELFT-01" in ids
    assert "CASIMIR-CAVITY-GENEVA-03" in ids

    # Harvest vacuum flux
    harvest = casimir_vacuum_harvester.harvest_vacuum_flux(
        resonator_id="CASIMIR-CAVITY-DELFT-01",
        pump_power_mw=75.0,
        pulse_duration_us=150.0,
    )
    assert harvest["result_id"].startswith("CASIMIR-FLUX-")
    assert harvest["correlated_photon_pairs_emitted"] > 0.0
    assert harvest["two_mode_squeezing_db"] > 10.0
    assert harvest["vacuum_zero_point_energy_harvested_uj"] > 0.0
    assert harvest["quantum_state_fidelity"] > 99.0
    assert harvest["status"] == "VACUUM_PHOTON_EMISSION_COHERENT"

    # Metrics
    metrics = casimir_vacuum_harvester.get_resonator_metrics()
    assert metrics["active_casimir_resonators"] >= 3
    assert metrics["lowest_cryo_temp_mk"] < 25.0
    assert metrics["status"] == "OPERATIONAL"

    # Validation failure
    with pytest.raises(ValueError):
        casimir_vacuum_harvester.harvest_vacuum_flux(
            resonator_id="NON-EXISTENT-RESONATOR"
        )


def test_casimir_vacuum_api():
    # GET resonators
    res = client.get("/api/casimir-vacuum/resonators")
    assert res.status_code == 200
    assert len(res.json()) >= 3

    # POST harvest-flux
    res_flux = client.post(
        "/api/casimir-vacuum/harvest-flux",
        json={
            "resonator_id": "CASIMIR-CAVITY-BOULDER-02",
            "pump_power_mw": 60.0,
            "pulse_duration_us": 120.0,
        },
    )
    assert res_flux.status_code == 200
    flux_data = res_flux.json()
    assert flux_data["correlated_photon_pairs_emitted"] > 0.0

    # POST invalid resonator -> 400
    res_err = client.post(
        "/api/casimir-vacuum/harvest-flux",
        json={
            "resonator_id": "INVALID-CAVITY",
        },
    )
    assert res_err.status_code == 400

    # GET metrics
    res_met = client.get("/api/casimir-vacuum/metrics")
    assert res_met.status_code == 200
    assert res_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------
# Capability 85: Non-Abelian Anyon Topological Braiding Matrix
# ---------------------------------------------------------
def test_anyon_braiding_service():
    matrices = anyon_topological_braiding.list_matrices()
    assert len(matrices) >= 3
    ids = [m["matrix_id"] for m in matrices]
    assert "ANYON-CORE-COPENHAGEN-01" in ids
    assert "ANYON-CORE-SANTA-BARBARA-02" in ids

    # Execute braid operation
    braid = anyon_topological_braiding.execute_braid_operation(
        matrix_id="ANYON-CORE-SANTA-BARBARA-02",
        braid_word="sigma_1 * sigma_2^-1 * sigma_1",
        target_qubit_id="TOPO-QUBIT-04",
        gate_type="HADAMARD",
    )
    assert braid["operation_id"].startswith("ANYON-BRAID-")
    assert braid["topological_fidelity_pct"] > 99.99
    assert braid["homotopy_invariance_verified"] is True
    assert "|psi>" in braid["qubit_superposition_state"]
    assert braid["status"] == "BRAID_HOMOTOPY_COMMUTATION_VERIFIED"

    # Metrics
    metrics = anyon_topological_braiding.get_topological_metrics()
    assert metrics["active_topological_matrices"] >= 3
    assert metrics["total_logical_topological_qubits"] >= 64
    assert metrics["mean_noise_suppression_db"] > 80.0
    assert metrics["status"] == "OPERATIONAL"

    # Validation failure
    with pytest.raises(ValueError):
        anyon_topological_braiding.execute_braid_operation(
            matrix_id="UNKNOWN-QPU-MATRIX"
        )


def test_anyon_braiding_api():
    # GET matrices
    res = client.get("/api/anyon-braiding/matrices")
    assert res.status_code == 200
    assert len(res.json()) >= 3

    # POST execute-braid
    res_braid = client.post(
        "/api/anyon-braiding/execute-braid",
        json={
            "matrix_id": "ANYON-CORE-COPENHAGEN-01",
            "braid_word": "sigma_2 * sigma_1",
            "target_qubit_id": "TOPO-QUBIT-02",
            "gate_type": "PHASE_S",
        },
    )
    assert res_braid.status_code == 200
    data = res_braid.json()
    assert data["homotopy_invariance_verified"] is True

    # POST invalid matrix -> 400
    res_err = client.post(
        "/api/anyon-braiding/execute-braid",
        json={
            "matrix_id": "INVALID-MATRIX",
        },
    )
    assert res_err.status_code == 400

    # GET metrics
    res_met = client.get("/api/anyon-braiding/metrics")
    assert res_met.status_code == 200
    assert res_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------
# Option B: Sovereign QKD Space-Mesh Relay Engine
# ---------------------------------------------------------
def test_qkd_space_mesh_service():
    nodes = qkd_space_mesh_relay.list_nodes()
    assert len(nodes) >= 4
    ids = [n["node_id"] for n in nodes]
    assert "QKD-EARTH-CANARY-01" in ids
    assert "QKD-GATEWAY-LUNAR-02" in ids
    assert "QKD-RELAY-LAGRANGE-L1-03" in ids
    assert "QKD-PROBE-MARS-ORBIT-04" in ids

    # Entanglement swap
    swap = qkd_space_mesh_relay.swap_entanglement(
        origin_node_id="QKD-EARTH-CANARY-01",
        relay_node_id="QKD-RELAY-LAGRANGE-L1-03",
        destination_node_id="QKD-PROBE-MARS-ORBIT-04",
    )
    assert swap["swap_id"].startswith("QKD-SWAP-")
    assert swap["entanglement_fidelity"] > 0.95
    assert swap["end_to_end_distance_km"] > 100000000.0  # Over 100 million km
    assert swap["secure_key_rate_kbps"] > 0.0
    assert swap["zero_trust_signature_verified"] is True
    assert swap["status"] == "INTERPLANETARY_ENTANGLEMENT_SWAP_ESTABLISHED"

    # Metrics
    metrics = qkd_space_mesh_relay.get_mesh_metrics()
    assert metrics["active_space_mesh_nodes"] >= 4
    assert metrics["max_quantum_reach_km"] >= 200000000.0
    assert metrics["mean_qber_pct"] < 5.0  # Well below 11% QKD threshold
    assert metrics["status"] == "OPERATIONAL"

    # Validation failure
    with pytest.raises(ValueError):
        qkd_space_mesh_relay.swap_entanglement(
            origin_node_id="INVALID-GROUND-STATION",
            relay_node_id="QKD-RELAY-LAGRANGE-L1-03",
            destination_node_id="QKD-PROBE-MARS-ORBIT-04",
        )


def test_qkd_space_mesh_api():
    # GET nodes
    res = client.get("/api/qkd-space-mesh/nodes")
    assert res.status_code == 200
    assert len(res.json()) >= 4

    # POST swap-entanglement
    res_swap = client.post(
        "/api/qkd-space-mesh/swap-entanglement",
        json={
            "origin_node_id": "QKD-EARTH-CANARY-01",
            "relay_node_id": "QKD-GATEWAY-LUNAR-02",
            "destination_node_id": "QKD-RELAY-LAGRANGE-L1-03",
        },
    )
    assert res_swap.status_code == 200
    data = res_swap.json()
    assert data["entanglement_fidelity"] > 0.95

    # POST invalid node -> 400
    res_err = client.post(
        "/api/qkd-space-mesh/swap-entanglement",
        json={
            "origin_node_id": "INVALID-NODE",
            "relay_node_id": "QKD-GATEWAY-LUNAR-02",
            "destination_node_id": "QKD-RELAY-LAGRANGE-L1-03",
        },
    )
    assert res_err.status_code == 400

    # GET metrics
    res_met = client.get("/api/qkd-space-mesh/metrics")
    assert res_met.status_code == 200
    assert res_met.json()["status"] == "OPERATIONAL"
