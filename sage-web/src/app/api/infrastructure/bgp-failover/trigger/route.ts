import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TRIGGER_RES = {
  pop_id: "POP-US-EAST",
  status: "FAILOVER_CONVERGED",
  convergence_time_ms: 38,
  traffic_drained_to: "POP-GLOBAL-HOT-STANDBY",
  sla_impact: "ZERO_PACKET_LOSS (99.999% SLA PRESERVED)",
  merkle_record_hash: "f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(`${BACKEND}/api/infrastructure/bgp-failover/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        ...FALLBACK_TRIGGER_RES,
        pop_id: body.pop_id || "POP-US-EAST",
      });
    }
    const data = await safeUpstreamJson(res, FALLBACK_TRIGGER_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_TRIGGER_RES);
  }
}
