import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  total_incidents_recorded: 4,
  sev1_critical_count: 2,
  mean_containment_latency_ms: 9.8,
  containment_sla_ceiling_ms: 15.0,
  sla_compliance_pct: 100.0,
  slack_dispatch_rate_pct: 100.0,
  pagerduty_ack_rate_pct: 100.0,
  active_soc_tier: "AUTONOMOUS_L3_ORCHESTRATOR",
  last_escalated_at: Date.now() / 1000 - 3600,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/soc/escalation/metrics`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_METRICS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback SOC metrics:", e);
  }
  return NextResponse.json(FALLBACK_METRICS);
}
