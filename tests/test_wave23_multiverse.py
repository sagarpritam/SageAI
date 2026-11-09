"""
Unit & Integration Tests for Wave 23: Multiverse Everett-Wheeler Quantum Branch Resolver,
ER=EPR Wormhole Metric Siphon, False Vacuum Nucleation Shield & Orbital HPM Directed Energy Grid (Capabilities 89-91 + Option B).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.everett_branch_resolver import everett_branch_resolver
from app.services.er_bridge_siphon import er_bridge_metric_siphon
from app.services.false_vacuum_shield import false_vacuum_decay_shield
from app.services.orbital_hpm_grid import orbital_hpm_grid

client = TestClient(app)


# ---------------------------------------------------------------------------
# Capability 89: Everett-Wheeler Quantum Branch Entropy Resolver
# ---------------------------------------------------------------------------
def test_everett_branch_service():
    branches = everett_branch_resolver.list_branches()
    assert len(branches) >= 4
    b = branches[0]
    assert "branch_id" in b
    assert "amplitude_magnitude" in b
    assert "probability_weight" in b

    res = everett_branch_resolver.resolve_branch_entropy(
        primary_branch_id="EVERETT-BRANCH-PRIME-01",
        phase_alignment_gain=1.2,
    )
    assert res["resolution_id"].startswith("EVERETT-RESOLVE-")
    assert res["von_neumann_branch_entropy_nats"] > 0.0
    assert res["consensus_branch_stability_pct"] > 99.0
    assert res["status"] == "QUANTUM_BRANCH_ENTROPY_RESOLVED"

    metrics = everett_branch_resolver.get_resolution_metrics()
    assert metrics["active_hilbert_branches"] >= 4
    assert metrics["completed_entropy_resolutions"] >= 1
    assert metrics["status"] == "OPERATIONAL"


def test_everett_branch_api():
    r_br = client.get("/api/everett-branch/branches")
    assert r_br.status_code == 200
    assert len(r_br.json()) >= 4

    r_res = client.post(
        "/api/everett-branch/resolve-entropy",
        json={
            "primary_branch_id": "EVERETT-BRANCH-ATTACK-02",
            "phase_alignment_gain": 1.0,
        },
    )
    assert r_res.status_code == 200
    data = r_res.json()
    assert data["primary_branch_id"] == "EVERETT-BRANCH-ATTACK-02"
    assert data["von_neumann_branch_entropy_nats"] > 0.0

    r_met = client.get("/api/everett-branch/metrics")
    assert r_met.status_code == 200
    assert r_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------------------------
# Capability 90: ER=EPR Spacetime Wormhole Metric Siphon
# ---------------------------------------------------------------------------
def test_er_bridge_service():
    throats = er_bridge_metric_siphon.list_throats()
    assert len(throats) >= 3
    t = throats[0]
    assert "throat_id" in t
    assert "throat_radius_attometers" in t
    assert "siphon_throughput_capacity_gw" in t

    res = er_bridge_metric_siphon.siphon_metric_flux(
        throat_id="ER-THROAT-CERN-01",
        target_energy_surge_source="PROMPT_NUCLEAR_FIREBALL_SURGE",
        incident_power_gw=700.0,
    )
    assert res["event_id"].startswith("ER-SIPHON-")
    assert res["siphoned_energy_flux_gw"] > 600.0
    assert res["flux_dissipation_sink_verified"] is True
    assert res["status"] == "METRIC_FLUX_SIPHONED_SUCCESSFULLY"

    metrics = er_bridge_metric_siphon.get_siphon_metrics()
    assert metrics["active_er_bridge_throats"] >= 3
    assert metrics["completed_flux_siphons"] >= 1
    assert metrics["status"] == "OPERATIONAL"


def test_er_bridge_api():
    r_th = client.get("/api/er-bridge/throats")
    assert r_th.status_code == 200
    assert len(r_th.json()) >= 3

    r_siph = client.post(
        "/api/er-bridge/siphon-metric-flux",
        json={
            "throat_id": "ER-THROAT-GRAN-SASSO-02",
            "target_energy_surge_source": "RELATIVISTIC_BEAM_SURGE",
            "incident_power_gw": 500.0,
        },
    )
    assert r_siph.status_code == 200
    data = r_siph.json()
    assert data["siphoned_energy_flux_gw"] > 400.0

    r_met = client.get("/api/er-bridge/metrics")
    assert r_met.status_code == 200
    assert r_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------------------------
# Capability 91: Quantum Vacuum False Decay Bubble Nucleation Shield
# ---------------------------------------------------------------------------
def test_false_vacuum_service():
    chambers = false_vacuum_decay_shield.list_chambers()
    assert len(chambers) >= 3
    c = chambers[0]
    assert "chamber_id" in c
    assert "higgs_field_vev_gev" in c
    assert "coleman_de_luccia_bounce_action_b" in c

    res = false_vacuum_decay_shield.quench_nucleation_seed(
        chamber_id="VACUUM-SHIELD-GENEVA-01",
        simulated_instanton_perturbation="MICROSCOPIC_BLACK_HOLE_CATALYZED_TUNNELING",
        counter_bias_power_tw=50.0,
    )
    assert res["event_id"].startswith("VAC-QUENCH-")
    assert res["critical_bubble_seed_collapsed"] is True
    assert res["post_quench_decay_suppression_orders"] > 100.0
    assert res["status"] == "FALSE_VACUUM_NUCLEATION_QUENCHED"

    metrics = false_vacuum_decay_shield.get_shield_metrics()
    assert metrics["monitored_vacuum_chambers"] >= 3
    assert metrics["completed_nucleation_quenches"] >= 1
    assert metrics["status"] == "OPERATIONAL"


def test_false_vacuum_api():
    r_ch = client.get("/api/false-vacuum/chambers")
    assert r_ch.status_code == 200
    assert len(r_ch.json()) >= 3

    r_quench = client.post(
        "/api/false-vacuum/quench-nucleation",
        json={
            "chamber_id": "VACUUM-SHIELD-FERMILAB-02",
            "simulated_instanton_perturbation": "COSMIC_STRING_COLLAPSE_PERTURBATION",
            "counter_bias_power_tw=45.0": 45.0,
        },
    )
    assert r_quench.status_code == 200
    data = r_quench.json()
    assert data["critical_bubble_seed_collapsed"] is True

    r_met = client.get("/api/false-vacuum/metrics")
    assert r_met.status_code == 200
    assert r_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------------------------
# Option B: Orbital High-Power Microwave (HPM) Electronics Directed Energy Grid
# ---------------------------------------------------------------------------
def test_orbital_hpm_service():
    sats = orbital_hpm_grid.list_satellites()
    assert len(sats) >= 4
    s = sats[0]
    assert "satellite_id" in s
    assert "peak_pulse_power_gw" in s
    assert s["peak_pulse_power_gw"] >= 1.5

    res = orbital_hpm_grid.fire_hpm_pulse(
        satellite_id="HPM-SAT-LEO-ALPHA-01",
        target_identifier="RADAR-BATTERY-S400-SECTOR-9",
        target_category="SAM_RADAR_PHASED_ARRAY",
        pulse_duration_ns=250.0,
    )
    assert res["discharge_id"].startswith("HPM-FIRE-")
    assert res["induced_voltage_spike_volts"] > 2000.0
    assert res["semiconductor_burnout_verified"] is True
    assert res["status"] == "PULSED_DIRECTED_ENERGY_DISCHARGE_SUCCESSFUL"

    metrics = orbital_hpm_grid.get_grid_metrics()
    assert metrics["active_hpm_satellites"] >= 4
    assert metrics["total_hpm_discharges"] >= 1
    assert metrics["electronics_burnout_success_pct"] == 100.0
    assert metrics["constellation_status"] == "HIGH_POWER_MICROWAVE_GRID_READY"


def test_orbital_hpm_api():
    r_arr = client.get("/api/orbital-hpm/arrays")
    assert r_arr.status_code == 200
    assert len(r_arr.json()) >= 4

    r_fire = client.post(
        "/api/orbital-hpm/fire-pulse",
        json={
            "satellite_id": "HPM-SAT-LEO-BRAVO-02",
            "target_identifier": "C4ISR-COMMAND-POST-EAST",
            "target_category": "C4ISR_BUNKER_ELECTRONICS",
            "pulse_duration_ns": 300.0,
        },
    )
    assert r_fire.status_code == 200
    data = r_fire.json()
    assert data["semiconductor_burnout_verified"] is True
    assert data["kill_assessment"] == "HARD_ELECTRONIC_KILL_LNA_JUNCTION_MELTDOWN"

    r_met = client.get("/api/orbital-hpm/metrics")
    assert r_met.status_code == 200
    assert r_met.json()["active_hpm_satellites"] >= 4
