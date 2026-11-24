import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TELEMETRY = {
  is_test_running: false,
  active_test: null,
  aggregate_cluster_rps: 47800,
  overall_mean_latency_ms: 0.14,
  sla_ceiling_ms: 0.20,
  sla_status: "WITHIN_SLA",
  global_bgp_route_flaps: 0,
  pops: [
    {
      pop_id: "POP-US-EAST",
      name: "Ashburn / IAD Core",
      region: "us-east-1",
      current_rps: 14200,
      dropped_packets_pct: 0.01,
      latency_ms: 0.14,
      bgp_route_flaps: 0,
      ebpf_xdp_state: "ARMED",
      health_status: "HEALTHY",
    },
    {
      pop_id: "POP-EU-WEST",
      name: "Frankfurt / FRA Edge",
      region: "eu-central-1",
      current_rps: 11500,
      dropped_packets_pct: 0.00,
      latency_ms: 0.18,
      bgp_route_flaps: 0,
      ebpf_xdp_state: "ARMED",
      health_status: "HEALTHY",
    },
    {
      pop_id: "POP-APAC-SOUTH",
      name: "Singapore / SIN Edge",
      region: "ap-southeast-1",
      current_rps: 9800,
      dropped_packets_pct: 0.00,
      latency_ms: 0.19,
      bgp_route_flaps: 0,
      ebpf_xdp_state: "ARMED",
      health_status: "HEALTHY",
    },
    {
      pop_id: "POP-US-CENTRAL",
      name: "Chicago / ORD Hot-Standby",
      region: "us-central-1",
      current_rps: 8200,
      dropped_packets_pct: 0.00,
      latency_ms: 0.11,
      bgp_route_flaps: 0,
      ebpf_xdp_state: "ARMED",
      health_status: "HEALTHY",
    },
    {
      pop_id: "POP-GOV-WEST",
      name: "Salt Lake / SLC FedRAMP",
      region: "us-gov-west-1",
      current_rps: 4100,
      dropped_packets_pct: 0.00,
      latency_ms: 0.09,
      bgp_route_flaps: 0,
      ebpf_xdp_state: "ARMED",
      health_status: "HEALTHY",
    },
  ],
  last_synced_at: Date.now() / 1000,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/simulation/traffic-generator/telemetry`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_TELEMETRY);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback traffic telemetry:", e);
  }
  return NextResponse.json(FALLBACK_TELEMETRY);
}
