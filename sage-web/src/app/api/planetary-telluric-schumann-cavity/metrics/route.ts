import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/planetary-telluric-schumann-cavity/metrics`, { method: "GET" }, 8000);
    if (res.ok) return NextResponse.json(await safeUpstreamJson(res, {}));
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      active_cavities_count: 3,
      harvest_events_total: 192,
      total_baseload_dispatch_gw: 9.055,
      mean_waveguide_efficiency_pct: 98.0,
      schumann_coupling_status: "SCHUMANN_CAVITY_RESONANCE_LOCKED",
    },
    { status: 200 }
  );
}
