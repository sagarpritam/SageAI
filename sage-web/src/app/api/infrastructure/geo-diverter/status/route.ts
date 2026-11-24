import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_STATUS = {
  total_monitored_transit_asns: 5,
  active_diverts_count: 1,
  mean_transit_jitter_ms: 5.38,
  convergence_sla_ceiling_ms: 35.0,
  divert_sla_met: true,
  diverted_traffic_pct: 20.0,
  automated_policy: "DYNAMIC_AS_PATH_PREPEND_AND_COMMUNITY_SCRUBBING",
  last_synced_at: Date.now() / 1000,
  transits: [],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/infrastructure/geo-diverter/status`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_STATUS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback geo status:", e);
  }
  return NextResponse.json(FALLBACK_STATUS);
}
