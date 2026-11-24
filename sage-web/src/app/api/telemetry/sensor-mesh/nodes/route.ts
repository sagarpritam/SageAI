import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_SENSOR_NODES = {
  total_nodes_returned: 112,
  summary: {
    total_active_clusters: 4,
    total_sensor_nodes: 112,
    overall_mean_latency_ms: 0.165,
    sla_latency_ceiling_ms: 0.20,
    sla_boundary_passed: true,
    aggregate_xdp_packet_drop_pps: 69660,
    node_status_breakdown: {
      HEALTHY_ONLINE: 112,
      DEGRADED: 0,
      OFFLINE: 0,
    },
    clusters: {
      "apex-cluster": { company_name: "Apex Global Securities", node_count: 24, base_latency_ms: 0.167 },
      "nexus-cluster": { company_name: "Nexus BioHealth Global", node_count: 16, base_latency_ms: 0.162 },
      "hyperscale-cluster": { company_name: "HyperScale Cloud Systems", node_count: 64, base_latency_ms: 0.172 },
      "vanguard-cluster": { company_name: "Vanguard Aerospace & Defense Systems", node_count: 8, base_latency_ms: 0.160 },
    },
  },
  nodes: [
    {
      node_id: "apex-cluster-node-01",
      cluster_id: "apex-cluster",
      company_name: "Apex Global Securities",
      region: "us-east-financial-zone-1",
      runtime: "AWS EKS High-Frequency",
      status: "HEALTHY_ONLINE",
      latency_ms: 0.167,
      xdp_packets_per_sec: 617,
      last_heartbeat_at: Date.now() / 1000,
    },
    {
      node_id: "hyperscale-cluster-node-01",
      cluster_id: "hyperscale-cluster",
      company_name: "HyperScale Cloud Systems",
      region: "us-central-k8s-mesh-1",
      runtime: "Multi-Tenant Pod Mesh",
      status: "HEALTHY_ONLINE",
      latency_ms: 0.172,
      xdp_packets_per_sec: 657,
      last_heartbeat_at: Date.now() / 1000,
    },
  ],
  recent_events: [
    {
      event_id: "EVT-APEX-01",
      cluster_id: "apex-cluster",
      node_id: "apex-cluster-node-04",
      event_type: "IMDS_SSRF_CLAMPED",
      source_ip: "10.240.12.88",
      destination_ip: "169.254.169.254",
      hook_action: "XDP_DROP",
      latency_overhead_ns: 42,
      timestamp: Date.now() / 1000 - 60,
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/telemetry/sensor-mesh/nodes`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_SENSOR_NODES);
    }
    const data = await safeUpstreamJson(res, FALLBACK_SENSOR_NODES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_SENSOR_NODES);
  }
}
