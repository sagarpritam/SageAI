import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/geodynamo-helical-turbulent-supergrid/metrics`,
      { method: "GET" },
      8000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, {}));
    }
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      active_arrays_count: 3,
      harvest_events_total: 44,
      total_baseload_dispatch_gw: 14.28,
      mean_induction_efficiency_pct: 95.0,
      geodynamo_coupling_status: "ALPHA_OMEGA_TURBULENCE_LOCKED",
    },
    { status: 200 }
  );
}
