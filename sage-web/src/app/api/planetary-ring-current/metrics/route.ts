import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/planetary-ring-current/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Ring Current metrics:", err);
  }

  return NextResponse.json({
    active_tori_count: 3,
    harvest_events_total: 1,
    total_baseload_dispatch_gw: 10.32,
    mean_alfven_efficiency_pct: 99.13,
    alfven_coupling_status: "RING_CURRENT_ALFVEN_LOCKED",
  });
}
