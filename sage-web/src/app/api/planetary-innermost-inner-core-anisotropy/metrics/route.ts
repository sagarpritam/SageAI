import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/planetary-innermost-inner-core-anisotropy/metrics`,
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
      harvest_events_total: 147,
      total_baseload_dispatch_gw: 1117.2,
      mean_extraction_efficiency_pct: 95.0,
      innermost_core_coupling_status: "INNERMOST_INNER_CORE_ANISOTROPY_LOCKED",
    },
    { status: 200 }
  );
}
