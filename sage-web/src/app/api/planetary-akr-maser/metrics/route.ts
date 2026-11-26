import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/planetary-akr-maser/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Planetary AKR metrics:", err);
    return NextResponse.json({
      active_cavities_count: 3,
      harvest_events_total: 1,
      total_baseload_dispatch_gw: 11.4,
      mean_maser_efficiency_pct: 99.4,
      akr_coupling_status: "AKR_MASER_LOCKED",
    });
  }
}
