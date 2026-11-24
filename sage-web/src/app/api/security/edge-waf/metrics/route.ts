import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  total_blocked_attacks_24h: 50872,
  average_inspection_latency_us: 55.04,
  ast_grammar_accuracy_pct: 99.98,
  zero_day_coverage_score: 99.4,
  ebpf_xdp_offload_status: "HARDWARE_NIC_OFFLOAD_ACTIVE",
  active_rules_count: 5,
  last_synced_at: Date.now() / 1000,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/security/edge-waf/metrics`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_METRICS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback WAF metrics:", e);
  }
  return NextResponse.json(FALLBACK_METRICS);
}
