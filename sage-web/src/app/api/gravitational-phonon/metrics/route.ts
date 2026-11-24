import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_lattices_count: 3,
  harvest_events_total: 18,
  total_grid_dispatch_gw: 6.84,
  mean_mechanical_q_factor: 2.83e9,
  piezo_conversion_mean_pct: 94.0,
  planetary_phonon_grid_status: "SUPERGRID_SYNCHRONIZED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/gravitational-phonon/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
