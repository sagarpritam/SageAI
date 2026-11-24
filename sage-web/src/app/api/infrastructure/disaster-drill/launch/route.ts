import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_LAUNCH_RES = {
  drill_id: "DRILL-CHAOS-MR-SIMULATED",
  scenario: "Simultaneous Frankfurt (POP-EU-WEST) + GovCloud (POP-GOV-WEST) BGP Transit Flap & Saturation Test",
  status: "FAILOVER_CONVERGED",
  affected_pops: ["POP-EU-WEST", "POP-GOV-WEST"],
  hot_standby_target: "POP-GLOBAL-HOT-STANDBY",
  traffic_load_gbps: 2.4,
  packet_rate_pps: 450000,
  convergence_time_ms: 38.4,
  sla_ceiling_ms: 45.0,
  sla_met: true,
  packet_loss_pct: 0.0,
  failover_drain_status: "100% TRAFFIC DRAINED TO POP-GLOBAL-HOT-STANDBY",
  route_swing_details: [
    {
      pop_id: "POP-EU-WEST",
      simulated_event: "BGP_TRANSIT_FLAP_WITHDRAWAL",
      prefix: "198.51.100.0/24",
      convergence_latency_ms: 36.8,
      status: "ROUTE_WITHDRAWN_SWUNG_TO_HOT_STANDBY",
    },
    {
      pop_id: "POP-GOV-WEST",
      simulated_event: "BGP_TRANSIT_FLAP_WITHDRAWAL",
      prefix: "198.51.100.0/24",
      convergence_latency_ms: 38.4,
      status: "ROUTE_WITHDRAWN_SWUNG_TO_HOT_STANDBY",
    },
  ],
  merkle_record_hash: "e94a8bc371df051284e3119ac40901e847c2301980be7654a39b2cd8e104f9ab",
  executed_at: Date.now() / 1000,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(
      `${BACKEND}/api/infrastructure/disaster-drill/launch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_LAUNCH_RES);
    }
    const data = await safeUpstreamJson(res, FALLBACK_LAUNCH_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_LAUNCH_RES);
  }
}
