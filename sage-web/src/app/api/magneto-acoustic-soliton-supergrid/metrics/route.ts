import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_cavities_count: 3,
  harvest_events_total: 22,
  total_baseload_dispatch_gw: 13.15,
  mean_piezo_conversion_efficiency_pct: 95.0,
  cmb_transduction_status: "CORE_MANTLE_SOLITON_LOCKED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/magneto-acoustic-soliton-supergrid/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
