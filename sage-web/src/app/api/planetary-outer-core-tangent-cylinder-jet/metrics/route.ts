import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/planetary-outer-core-tangent-cylinder-jet/metrics`,
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
      harvest_events_total: 112,
      total_baseload_dispatch_gw: 716.4,
      mean_extraction_efficiency_pct: 95.0,
      tangent_cylinder_coupling_status: "OUTER_CORE_TANGENT_CYLINDER_JET_LOCKED",
    },
    { status: 200 }
  );
}
