import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_PROFILES = [
  {
    profile_id: "SYN_FLOOD_VOLUMETRIC",
    name: "Volumetric TCP SYN Flood (L4)",
    description: "Floods TCP SYN handshake queues to evaluate zero-copy eBPF XDP rate clamping and connection state table limits.",
    target_rps: 250000,
    protocol: "TCP / SYN",
    target_pop: "POP-US-EAST",
    simulated_actor: "Mirai-IoT Botnet Swarm",
    recommended_duration_sec: 30,
  },
  {
    profile_id: "HTTP2_RAPID_RESET",
    name: "HTTP/2 Rapid Reset Storm (L7)",
    description: "Generates thousands of simultaneous multiplexed streams immediately followed by RST_STREAM to test Envoy reverse-proxy resilience.",
    target_rps: 180000,
    protocol: "HTTP/2 Multiplexed",
    target_pop: "POP-EU-WEST",
    simulated_actor: "APT-41 RapidReset Swarm",
    recommended_duration_sec: 45,
  },
  {
    profile_id: "DNS_AMPLIFICATION",
    name: "Anycast DNS Amplification Storm (L4 UDP)",
    description: "Reflects high-ratio Anycast UDP 53 DNS responses against edge edge routers to verify BGP Anycast scrubbing routes.",
    target_rps: 220000,
    protocol: "UDP 53 (DNS EDNS0)",
    target_pop: "POP-APAC-SOUTH",
    simulated_actor: "Lazarus Reflection Swarm",
    recommended_duration_sec: 30,
  },
  {
    profile_id: "BENIGN_HIGH_CONCURRENCY",
    name: "Peak Enterprise Concurrency Benchmark",
    description: "Simulates organic Tier-1 enterprise traffic surges across all 5 Anycast POPs to test sub-0.20ms global SLA under heavy load.",
    target_rps: 150000,
    protocol: "TLS 1.3 / gRPC",
    target_pop: "ALL_POPS",
    simulated_actor: "Organic Global Fleet",
    recommended_duration_sec: 60,
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/simulation/traffic-generator/profiles`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_PROFILES);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback traffic profiles:", e);
  }
  return NextResponse.json(FALLBACK_PROFILES);
}
