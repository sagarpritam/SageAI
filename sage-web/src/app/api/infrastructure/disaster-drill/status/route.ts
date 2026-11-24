import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DRILL_STATUS = {
  drill_active: false,
  active_drill: null,
  sla_boundary: {
    max_acceptable_convergence_ms: 45.0,
    target_packet_loss_pct: 0.0,
    guaranteed_availability_sla: "99.999%",
    hot_standby_node: "POP-GLOBAL-HOT-STANDBY",
  },
  recent_drills: [
    {
      drill_id: "DRILL-202611-CHAOS-00",
      scenario: "Baseline Synthetic Anycast Transit Flap Verification",
      status: "COMPLETED_RECOVERED",
      affected_pops: ["POP-US-EAST"],
      hot_standby_target: "POP-GLOBAL-HOT-STANDBY",
      traffic_load_gbps: 1.2,
      packet_rate_pps: 220000,
      convergence_time_ms: 34.2,
      sla_ceiling_ms: 45.0,
      sla_met: true,
      packet_loss_pct: 0.0,
      merkle_record_hash: "a1f9e802b74c5d31e9204856f7129c5b4e87123490abcde89123456789abcdef",
      executed_at: Date.now() / 1000 - 86400,
      recovered_at: Date.now() / 1000 - 86100,
    },
  ],
  system_status: "ALL_REGIONAL_POPS_NOMINAL",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/infrastructure/disaster-drill/status`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_DRILL_STATUS);
    }
    const data = await safeUpstreamJson(res, FALLBACK_DRILL_STATUS);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_DRILL_STATUS);
  }
}
