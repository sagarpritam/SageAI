"""
Unit & Integration Tests for Wave 18 (Capabilities 74-76) and Option B (Autonomous Red-Team Cluster).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.cislunar_quantum_relay import cislunar_quantum_relay
from app.services.muon_tomography import subsurface_muon_tomography
from app.services.antimatter_containment import superconducting_antimatter_containment
from app.services.autonomous_redteam import autonomous_redteam_cluster

client = TestClient(app)


def test_cislunar_quantum_relay_service():
    nodes = cislunar_quantum_relay.list_nodes()
    assert len(nodes) >= 4
    node_ids = [n["node_id"] for n in nodes]
    assert "EARTH-OCP-TENERIFE" in node_ids
    assert "LAGRANGE-L1-HALO-1" in node_ids

    # Establish quantum link
    res = cislunar_quantum_relay.establish_quantum_link(
        source_id="EARTH-OCP-TENERIFE",
        target_id="LAGRANGE-L1-HALO-1",
        requested_oam_modes=[-2, -1, 0, 1, 2],
        atmospheric_turbulence_index=0.12,
    )
    assert res["transmission_id"].startswith("CISLUNAR-TX-")
    assert res["distance_km"] == 326400.0
    assert res["one_way_light_delay_sec"] > 1.0
    assert res["shapiro_delay_nsec"] > 0.0
    assert res["received_optical_power_dbm"] < -35.0
    assert res["quantum_bit_error_rate_qber"] < 0.11
    assert res["secure_key_rate_kbps"] > 10.0
    assert res["oam_aggregate_throughput_gbps"] > 100.0
    assert res["link_status"] in ["LOCK_OPTIMAL", "DEGRADED_JITTER"]

    metrics = cislunar_quantum_relay.get_relay_metrics()
    assert metrics["total_nodes"] >= 4
    assert metrics["active_oam_channels"] >= 10
    assert metrics["status"] == "OPERATIONAL"

    with pytest.raises(ValueError):
        cislunar_quantum_relay.establish_quantum_link("INVALID_SOURCE", "LAGRANGE-L1-HALO-1")


def test_muon_tomography_service():
    stations = subsurface_muon_tomography.list_stations()
    assert len(stations) >= 3
    station_ids = [s["station_id"] for s in stations]
    assert "MUON-TEL-ALPS-GRANITE" in station_ids

    # Execute tomographic inversion
    res = subsurface_muon_tomography.execute_tomographic_inversion(
        station_id="MUON-TEL-ALPS-GRANITE",
        target_zone="Mont Blanc Deep Shaft Adit-4",
        target_depth_meters=450.0,
        exposure_time_hours=8.0,
    )
    assert res["scan_id"].startswith("MUON-SCAN-")
    assert res["depth_meters"] == 450.0
    assert res["integrated_muon_events"] > 100_000
    assert len(res["detected_density_anomalies"]) >= 2
    assert res["void_detection_confidence_pct"] > 90.0
    assert res["high_z_material_confidence_pct"] > 90.0
    assert res["spatial_resolution_meters"] > 0.0
    assert res["reconstruction_time_ms"] > 0.0

    metrics = subsurface_muon_tomography.get_mesh_metrics()
    assert metrics["active_telescope_stations"] >= 3
    assert metrics["status"] == "OPERATIONAL"

    with pytest.raises(ValueError):
        subsurface_muon_tomography.execute_tomographic_inversion("UNKNOWN-STATION", "Zone-X")


def test_antimatter_containment_service():
    cells = superconducting_antimatter_containment.list_cells()
    assert len(cells) >= 3
    cell_ids = [c["cell_id"] for c in cells]
    assert "CELL-ALPHA-PENNING-01" in cell_ids

    # Telemetry
    telem = superconducting_antimatter_containment.monitor_plasma_dynamics("CELL-ALPHA-PENNING-01")
    assert telem["stored_antiprotons"] > 100_000_000
    assert telem["plasma_density_cm3"] > 1e6
    assert telem["quench_dump_readiness_pct"] > 99.0
    assert telem["status"] == "NOMINAL_CONFINED"

    # Rotating wall compression
    comp = superconducting_antimatter_containment.trigger_rotating_wall_compression(
        cell_id="CELL-ALPHA-PENNING-01",
        delta_voltage_v=0.4,
        target_radius_mm=1.35,
    )
    assert comp["compressed_plasma_radius_mm"] <= comp["previous_radius_mm"]
    assert comp["diocotron_suppression_ratio_db"] == -24.8

    # Fast quench divert protocol
    divert = superconducting_antimatter_containment.execute_fail_safe_quench_divert(
        cell_id="CELL-ALPHA-PENNING-01",
        reason="SCHEDULED_REGULATORY_VERIFICATION",
    )
    assert divert["diverted_antiproton_count"] > 0
    assert divert["total_annihilation_energy_joules"] > 0.0
    assert divert["breach_probability"] == 0.0
    assert divert["cell_state"] == "PURGED_SAFE_NEUTRALIZED"

    metrics = superconducting_antimatter_containment.get_matrix_metrics()
    assert metrics["active_containment_cells"] >= 3
    assert metrics["status"] == "NOMINAL_STABLE"


def test_autonomous_redteam_cluster_service():
    agents = autonomous_redteam_cluster.list_agents()
    assert len(agents) >= 4
    agent_ids = [a["agent_id"] for a in agents]
    assert "RED-ALPHA-EW" in agent_ids
    assert "RED-BETA-QUANTUM" in agent_ids

    # Launch adversarial campaign
    res = autonomous_redteam_cluster.launch_adversarial_campaign(
        target_domains=["ORBITAL_PNT", "QUANTUM_NETWORK", "DEEP_SPACE_RELAY", "SUBTERRANEAN_SEISMIC", "PLASMA_SHIELD"],
        intensity=0.90,
        target_capabilities_count=76,
    )
    assert res["campaign_id"].startswith("REDTEAM-CAMP-")
    assert res["simulated_attack_vectors"] >= 15
    assert res["deflection_success_pct"] >= 99.0
    assert res["mean_mitigation_latency_ms"] < 10.0
    assert res["blast_radius_containment_pct"] >= 99.0
    assert res["systemic_resilience_score"] > 99.0
    assert res["verdict"] == "ALL_VECTORS_DEFLECTED_ZERO_CASCADE"

    metrics = autonomous_redteam_cluster.get_cluster_metrics()
    assert metrics["active_red_agents"] >= 4
    assert metrics["coverage_capabilities"] == 76
    assert metrics["status"] == "OPERATIONAL"


def test_wave18_api_routes():
    # Cis-Lunar Relay
    r_nodes = client.get("/api/cislunar-relay/nodes")
    assert r_nodes.status_code == 200
    assert len(r_nodes.json()) >= 4

    r_link = client.post(
        "/api/cislunar-relay/establish-link",
        json={
            "source_id": "EARTH-OCP-TENERIFE",
            "target_id": "LAGRANGE-L1-HALO-1",
            "requested_oam_modes": [-1, 0, 1],
            "atmospheric_turbulence_index": 0.15,
        },
    )
    assert r_link.status_code == 200
    assert "transmission_id" in r_link.json()

    # Muon Tomography
    r_stations = client.get("/api/muon-tomography/stations")
    assert r_stations.status_code == 200
    assert len(r_stations.json()) >= 3

    r_scan = client.post(
        "/api/muon-tomography/execute-scan",
        json={
            "station_id": "MUON-TEL-ALPS-GRANITE",
            "target_zone": "Mont Blanc Deep Shaft",
            "target_depth_meters": 500.0,
            "exposure_time_hours": 12.0,
        },
    )
    assert r_scan.status_code == 200
    assert "scan_id" in r_scan.json()

    # Antimatter Containment
    r_cells = client.get("/api/antimatter-containment/cells")
    assert r_cells.status_code == 200
    assert len(r_cells.json()) >= 3

    r_telem = client.get("/api/antimatter-containment/telemetry/CELL-ALPHA-PENNING-01")
    assert r_telem.status_code == 200
    assert "stored_antiprotons" in r_telem.json()

    r_comp = client.post(
        "/api/antimatter-containment/compress-plasma",
        json={
            "cell_id": "CELL-ALPHA-PENNING-01",
            "delta_voltage_v": 0.5,
            "target_radius_mm": 1.45,
        },
    )
    assert r_comp.status_code == 200
    assert r_comp.json()["diocotron_suppression_ratio_db"] == -24.8

    r_divert = client.post(
        "/api/antimatter-containment/quench-divert",
        json={
            "cell_id": "CELL-ALPHA-PENNING-01",
            "reason": "SCHEDULED_TEST_QUENCH",
        },
    )
    assert r_divert.status_code == 200
    assert r_divert.json()["cell_state"] == "PURGED_SAFE_NEUTRALIZED"

    # Red-Team Cluster
    r_agents = client.get("/api/redteam-cluster/agents")
    assert r_agents.status_code == 200
    assert len(r_agents.json()) >= 4

    r_camp = client.post(
        "/api/redteam-cluster/launch-campaign",
        json={
            "target_domains": ["ORBITAL_PNT", "QUANTUM_NETWORK", "PLASMA_SHIELD"],
            "intensity": 0.88,
            "target_capabilities_count": 76,
        },
    )
    assert r_camp.status_code == 200
    assert r_camp.json()["verdict"] == "ALL_VECTORS_DEFLECTED_ZERO_CASCADE"

