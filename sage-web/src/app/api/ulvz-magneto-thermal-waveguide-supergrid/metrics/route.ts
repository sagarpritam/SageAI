import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/ulvz-magneto-thermal-waveguide-supergrid/metrics`,
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
      harvest_events_total: 41,
      total_baseload_dispatch_gw: 17.65,
      mean_extraction_efficiency_pct: 95.0,
      ulvz_coupling_status: "BASAL_SLURRY_WAVEGUIDE_LOCKED",
    },
    { status: 200 }
  );
}
