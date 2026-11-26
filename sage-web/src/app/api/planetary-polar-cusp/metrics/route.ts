import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/planetary-polar-cusp/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Planetary Polar Cusp metrics:", err);
    return NextResponse.json({
      active_funnels_count: 3,
      harvest_events_total: 1,
      total_baseload_dispatch_gw: 11.12,
      mean_funnel_efficiency_pct: 99.3,
      cusp_coupling_status: "POLAR_CUSP_FUNNEL_LOCKED",
    });
  }
}
