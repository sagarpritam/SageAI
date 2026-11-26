import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/planetary-magnetotail/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Planetary Magnetotail metrics:", err);
    return NextResponse.json({
      active_lobes_count: 3,
      harvest_events_total: 1,
      total_baseload_dispatch_gw: 10.58,
      mean_reconnection_efficiency_pct: 99.23,
      plasmoid_coupling_status: "MAGNETOTAIL_PLASMOID_LOCKED",
    });
  }
}
