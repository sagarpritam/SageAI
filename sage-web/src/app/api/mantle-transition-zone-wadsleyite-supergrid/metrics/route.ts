import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/mantle-transition-zone-wadsleyite-supergrid/metrics`,
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
      harvest_events_total: 39,
      total_baseload_dispatch_gw: 13.95,
      mean_extraction_efficiency_pct: 95.0,
      superionic_coupling_status: "HYDROUS_RINGWOODITE_CONDUCTION_LOCKED",
    },
    { status: 200 }
  );
}
