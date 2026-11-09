"""
Unit & Integration Tests for Wave 20 Grand Singularity Milestone (Capabilities 80-82)
and Option B Enterprise Multi-Region Multi-Cluster Federation Engine.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.cluster_federation import (
    cluster_federation_engine,
)
from app.services.quantum_gravitational_sensor import (
    quantum_gravitational_sensor,
)
from app.services.singularity_containment import (
    micro_singularity_containment,
)
from app.services.tachyon_horizon_sentinel import (
    tachyon_horizon_sentinel,
)

client = TestClient(app)


# ---------------------------------------------------------
# Capability 80: Quantum Gravitational Entanglement Sensor
# ---------------------------------------------------------
def test_quantum_gravitational_sensor_service():
    nodes = quantum_gravitational_sensor.list_nodes()
    assert len(nodes) >= 3
    node_ids = [n["node_id"] for n in nodes]
    assert "QGRAV-NODE-GENEVA-01" in node_ids
    assert "QGRAV-NODE-ORBITAL-L1-03" in node_ids

    # Nominal measurement
    nom_res = quantum_gravitational_sensor.measure_metric_distortion(
        node_id="QGRAV-NODE-GENEVA-01",
        target_region="LOCAL_DEEP_MANTLE_SECTOR_A",
        integration_time_sec=15.0,
    )
    assert nom_res["observation_id"].startswith("QGRAV-OBS-")
    assert nom_res["topological_defect_detected"] is False
    assert nom_res["status"] == "SPACETIME_GEODESIC_NOMINAL"
    assert nom_res["confidence_score"] > 90.0

    # Anomalous measurement
    anom_res = quantum_gravitational_sensor.measure_metric_distortion(
        node_id="QGRAV-NODE-CHEYENNE-02",
        target_region="LOCAL_EARTH_GEOID_SECTOR_7",
        integration_time_sec=45.0,
    )
    assert anom_res["topological_defect_detected"] is True
    assert anom_res["defect_classification"] == "ARTIFICIAL_METRIC_CONTRACTION_WAVE"
    assert anom_res["anomalous_mass_equivalent_kg"] > 0.0
    assert anom_res["status"] == "CRITICAL_SPACETIME_ANOMALY_CONFIRMED"

    # Metrics
    metrics = quantum_gravitational_sensor.get_sensor_metrics()
    assert metrics["active_gravitational_nodes"] >= 3
    assert metrics["completed_observations"] >= 2
    assert metrics["status"] == "OPERATIONAL"

    # Validation failure
    with pytest.raises(ValueError):
        quantum_gravitational_sensor.measure_metric_distortion(
            node_id="INVALID-QGRAV-NODE-999"
        )


def test_quantum_gravitational_api():
    # GET nodes
    res = client.get("/api/quantum-gravitational/nodes")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3

    # POST measure-distortion (nominal)
    res_meas = client.post(
        "/api/quantum-gravitational/measure-distortion",
        json={
            "node_id": "QGRAV-NODE-GENEVA-01",
            "target_region": "GEOID_BASELINE",
            "integration_time_sec": 20.0,
        },
    )
    assert res_meas.status_code == 200
    meas_data = res_meas.json()
    assert meas_data["observation_id"].startswith("QGRAV-OBS-")

    # POST measure-distortion (invalid node -> 400)
    res_err = client.post(
        "/api/quantum-gravitational/measure-distortion",
        json={
            "node_id": "NON-EXISTENT-NODE",
            "target_region": "GEOID_BASELINE",
        },
    )
    assert res_err.status_code == 400

    # GET metrics
    res_met = client.get("/api/quantum-gravitational/metrics")
    assert res_met.status_code == 200
    assert res_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------
# Capability 81: High-Energy Tachyon Field Cerenkov Sentinel
# ---------------------------------------------------------
def test_tachyon_horizon_sentinel_service():
    sentinels = tachyon_horizon_sentinel.list_sentinels()
    assert len(sentinels) >= 3
    sentinel_ids = [s["sentinel_id"] for s in sentinels]
    assert "TACHYON-SENTINEL-NORTH-POLE-01" in sentinel_ids
    assert "TACHYON-SENTINEL-SOUTH-PACIFIC-02" in sentinel_ids

    # Pre-causal sampling
    sample_res = tachyon_horizon_sentinel.sample_precausal_horizon(
        sentinel_id="TACHYON-SENTINEL-NORTH-POLE-01",
        target_threat_type="PROMPT_NUCLEAR_FLASH",
        simulated_apparent_velocity_c=1.55,
    )
    assert sample_res["alert_id"].startswith("PRECAUSAL-ALERT-")
    assert sample_res["pre_causal_lead_time_us"] < 0.0  # Must be negative (pre-causal)
    assert sample_res["cerenkov_cone_angle_deg"] > 0.0
    assert sample_res["defense_engagement_readiness_pct"] == 100.0
    assert sample_res["status"] == "PRE_CAUSAL_ANTICIPATION_LOCKED"

    # Metrics
    metrics = tachyon_horizon_sentinel.get_sentinel_metrics()
    assert metrics["active_sentinels"] >= 3
    assert metrics["pre_causal_alerts_logged"] >= 1
    assert metrics["status"] == "OPERATIONAL"

    # Validation failure
    with pytest.raises(ValueError):
        tachyon_horizon_sentinel.sample_precausal_horizon(
            sentinel_id="UNKNOWN-SENTINEL-XYZ"
        )


def test_tachyon_horizon_api():
    # GET sentinels
    res = client.get("/api/tachyon-horizon/sentinels")
    assert res.status_code == 200
    sentinels = res.json()
    assert len(sentinels) >= 3

    # POST sample-horizon
    res_sample = client.post(
        "/api/tachyon-horizon/sample-horizon",
        json={
            "sentinel_id": "TACHYON-SENTINEL-SOUTH-PACIFIC-02",
            "target_threat_type": "DIRECTED_RELATIVISTIC_PULSE",
            "simulated_apparent_velocity_c": 1.45,
        },
    )
    assert res_sample.status_code == 200
    samp_data = res_sample.json()
    assert samp_data["pre_causal_lead_time_us"] < 0.0

    # POST sample-horizon (invalid -> 400)
    res_err = client.post(
        "/api/tachyon-horizon/sample-horizon",
        json={
            "sentinel_id": "INVALID-SENTINEL",
        },
    )
    assert res_err.status_code == 400

    # GET metrics
    res_met = client.get("/api/tachyon-horizon/metrics")
    assert res_met.status_code == 200
    assert res_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------
# Capability 82: Micro-Singularity Hawking Containment
# ---------------------------------------------------------
def test_singularity_containment_service():
    cells = micro_singularity_containment.list_cells()
    assert len(cells) >= 3
    cell_ids = [c["cell_id"] for c in cells]
    assert "SINGULARITY-VAULT-GENEVA-01" in cell_ids

    # Telemetry sampling
    telem = micro_singularity_containment.sample_singularity_telemetry(
        "SINGULARITY-VAULT-GENEVA-01"
    )
    assert telem["telemetry_id"].startswith("SING-TEL-")
    assert telem["hawking_luminosity_pw"] > 0.0
    assert 0.95 <= telem["matter_feed_balance_ratio"] <= 1.05
    assert telem["containment_integrity_pct"] > 99.9
    assert telem["status"] == "NOMINAL_HAWKING_POWER_EXTRACTED"

    # Adjust feed
    adj = micro_singularity_containment.adjust_relativistic_matter_feed(
        cell_id="SINGULARITY-VAULT-GENEVA-01",
        delta_rate_kg_s=0.04,
    )
    assert adj["cell_id"] == "SINGULARITY-VAULT-GENEVA-01"
    assert adj["new_injection_rate_kg_s"] == round(0.26 + 0.04, 4)
    assert adj["mass_stabilization_state"] == "MASS_DRIFT_COMPENSATED"

    # Metrics
    metrics = micro_singularity_containment.get_matrix_metrics()
    assert metrics["active_singularity_cells"] >= 3
    assert metrics["total_hawking_power_pw"] > 0.0
    assert metrics["status"] == "OPERATIONAL"

    # Invalid cell
    with pytest.raises(ValueError):
        micro_singularity_containment.sample_singularity_telemetry("NON-EXISTENT-CELL")


def test_singularity_containment_api():
    # GET cells
    res = client.get("/api/singularity-containment/cells")
    assert res.status_code == 200
    assert len(res.json()) >= 3

    # POST telemetry
    res_telem = client.post(
        "/api/singularity-containment/telemetry/SINGULARITY-VAULT-CHEYENNE-02"
    )
    assert res_telem.status_code == 200
    assert res_telem.json()["hawking_luminosity_pw"] > 0.0

    # POST adjust-feed
    res_adj = client.post(
        "/api/singularity-containment/adjust-feed",
        json={
            "cell_id": "SINGULARITY-VAULT-CHEYENNE-02",
            "delta_rate_kg_s": 0.02,
        },
    )
    assert res_adj.status_code == 200
    assert res_adj.json()["mass_stabilization_state"] == "MASS_DRIFT_COMPENSATED"

    # POST adjust-feed invalid cell -> 400
    res_err = client.post(
        "/api/singularity-containment/adjust-feed",
        json={
            "cell_id": "UNKNOWN-CELL",
            "delta_rate_kg_s": 0.01,
        },
    )
    assert res_err.status_code == 400

    # GET metrics
    res_met = client.get("/api/singularity-containment/metrics")
    assert res_met.status_code == 200
    assert res_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------
# Option B: Enterprise Multi-Region Multi-Cluster Federation
# ---------------------------------------------------------
def test_cluster_federation_service():
    clusters = cluster_federation_engine.list_clusters()
    assert len(clusters) >= 4
    cluster_ids = [c["cluster_id"] for c in clusters]
    assert "CLUSTER-US-EAST-01" in cluster_ids
    assert "CLUSTER-EU-CENTRAL-02" in cluster_ids
    assert "CLUSTER-APAC-TOKYO-03" in cluster_ids
    assert "CLUSTER-ORBITAL-L1-04" in cluster_ids

    # Synchronize cluster state
    sync_res = cluster_federation_engine.synchronize_cluster_state(
        initiating_cluster_id="CLUSTER-US-EAST-01",
        target_cluster_id="CLUSTER-EU-CENTRAL-02",
        capabilities_count=82,
    )
    assert sync_res["sync_id"].startswith("FED-SYNC-")
    assert len(sync_res["synchronized_merkle_root"]) == 64  # SHA256 length
    assert sync_res["synced_capabilities_count"] == 82
    assert sync_res["zero_trust_token_verified"] is True
    assert sync_res["failover_route_established"] is True
    assert sync_res["status"] == "CONSENSUS_SYNCHRONIZED"

    # Automated failover
    failover_res = cluster_federation_engine.trigger_automated_failover(
        failing_cluster_id="CLUSTER-EU-CENTRAL-02",
        backup_cluster_id="CLUSTER-US-EAST-01",
        reason="SIMULATED_REGIONAL_EMP_ISOLATION",
    )
    assert failover_res["isolated_cluster_id"] == "CLUSTER-EU-CENTRAL-02"
    assert failover_res["active_failover_cluster_id"] == "CLUSTER-US-EAST-01"
    assert failover_res["failover_latency_ms"] < 12.0  # SLA limit sub-12ms
    assert failover_res["traffic_reroute_status"] == "100%_TRAFFIC_DEFLECTED_TO_BACKUP"
    assert failover_res["state_loss_pct"] == 0.0

    # Metrics
    metrics = cluster_federation_engine.get_federation_metrics()
    assert metrics["total_federated_clusters"] >= 4
    assert metrics["total_federated_nodes"] >= 40
    assert metrics["failover_sla_limit_ms"] == 12.0
    assert metrics["status"] == "OPERATIONAL"

    # Invalid cluster error handling
    with pytest.raises(ValueError):
        cluster_federation_engine.synchronize_cluster_state(
            initiating_cluster_id="INVALID-CLUSTER-A",
            target_cluster_id="CLUSTER-EU-CENTRAL-02",
        )


def test_cluster_federation_api():
    # GET clusters
    res = client.get("/api/cluster-federation/clusters")
    assert res.status_code == 200
    clusters = res.json()
    assert len(clusters) >= 4

    # POST sync
    res_sync = client.post(
        "/api/cluster-federation/sync",
        json={
            "initiating_cluster_id": "CLUSTER-US-EAST-01",
            "target_cluster_id": "CLUSTER-APAC-TOKYO-03",
            "capabilities_count": 82,
        },
    )
    assert res_sync.status_code == 200
    sync_data = res_sync.json()
    assert sync_data["status"] == "CONSENSUS_SYNCHRONIZED"
    assert len(sync_data["synchronized_merkle_root"]) == 64

    # POST failover
    res_fo = client.post(
        "/api/cluster-federation/failover",
        json={
            "failing_cluster_id": "CLUSTER-APAC-TOKYO-03",
            "backup_cluster_id": "CLUSTER-US-EAST-01",
            "reason": "UNDERSEA_CABLE_SEVERED",
        },
    )
    assert res_fo.status_code == 200
    fo_data = res_fo.json()
    assert fo_data["failover_latency_ms"] < 12.0

    # POST sync invalid cluster -> 400
    res_err = client.post(
        "/api/cluster-federation/sync",
        json={
            "initiating_cluster_id": "INVALID-C1",
            "target_cluster_id": "CLUSTER-US-EAST-01",
        },
    )
    assert res_err.status_code == 400

    # GET metrics
    res_met = client.get("/api/cluster-federation/metrics")
    assert res_met.status_code == 200
    assert res_met.json()["status"] == "OPERATIONAL"
