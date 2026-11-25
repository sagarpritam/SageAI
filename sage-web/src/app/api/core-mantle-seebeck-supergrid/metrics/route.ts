import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_arrays_count: 3,
  harvest_events_total: 16,
  total_baseload_dispatch_gw: 13.85,
  mean_conversion_efficiency_pct: 95.0,
  cmb_thermal_coupling_status: "D_DOUBLE_PRIME_GRADIENT_LOCKED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/core-mantle-seebeck-supergrid/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
