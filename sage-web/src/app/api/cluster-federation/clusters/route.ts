import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      cluster_id: "CLUSTER-US-EAST-01",
      region_name: "us-east-virginia",
      datacenter_type: "AIRGAPPED_ENCLAVE",
      endpoint_url: "https://us-east.enclave.sageai.internal",
      active_nodes: 16,
      round_trip_latency_ms: 8.5,
      bft_consensus_weight: 0.3,
      merkle_state_root_sha256: "7c0dc60b4e28a5a8f01b1e948c3d9a1f4e2b8c5a6d9e1f2a3b4c5d6e7f8a9b0c",
      is_leader: true,
      cluster_health: "HEALTHY_FEDERATED",
    },
    {
      cluster_id: "CLUSTER-EU-CENTRAL-02",
      region_name: "eu-central-frankfurt",
      datacenter_type: "AIRGAPPED_ENCLAVE",
      endpoint_url: "https://eu-central.enclave.sageai.internal",
      active_nodes: 14,
      round_trip_latency_ms: 11.2,
      bft_consensus_weight: 0.25,
      merkle_state_root_sha256: "7c0dc60b4e28a5a8f01b1e948c3d9a1f4e2b8c5a6d9e1f2a3b4c5d6e7f8a9b0c",
      is_leader: false,
      cluster_health: "HEALTHY_FEDERATED",
    },
    {
      cluster_id: "CLUSTER-APAC-TOKYO-03",
      region_name: "apac-tokyo",
      datacenter_type: "SUBTERRANEAN_BUNKER",
      endpoint_url: "https://apac-tokyo.bunker.sageai.internal",
      active_nodes: 12,
      round_trip_latency_ms: 34.2,
      bft_consensus_weight: 0.25,
      merkle_state_root_sha256: "7c0dc60b4e28a5a8f01b1e948c3d9a1f4e2b8c5a6d9e1f2a3b4c5d6e7f8a9b0c",
      is_leader: false,
      cluster_health: "HEALTHY_FEDERATED",
    },
    {
      cluster_id: "CLUSTER-ORBITAL-L1-04",
      region_name: "orbital-lagrange-l1",
      datacenter_type: "ORBITAL_GATEWAY",
      endpoint_url: "https://orbital-l1.gateway.sageai.internal",
      active_nodes: 8,
      round_trip_latency_ms: 1088.0,
      bft_consensus_weight: 0.2,
      merkle_state_root_sha256: "7c0dc60b4e28a5a8f01b1e948c3d9a1f4e2b8c5a6d9e1f2a3b4c5d6e7f8a9b0c",
      is_leader: false,
      cluster_health: "HEALTHY_FEDERATED",
    },
  ]);
}
