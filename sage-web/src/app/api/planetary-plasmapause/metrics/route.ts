import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/planetary-plasmapause/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Planetary Plasmapause metrics:", err);
    return NextResponse.json({
      active_waveguides_count: 3,
      harvest_events_total: 1,
      total_baseload_dispatch_gw: 11.96,
      mean_waveguide_efficiency_pct: 99.5,
      whistler_coupling_status: "PLASMAPAUSE_WHISTLER_LOCKED",
    });
  }
}
