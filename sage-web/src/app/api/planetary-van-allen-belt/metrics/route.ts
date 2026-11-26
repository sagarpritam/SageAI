import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/planetary-van-allen-belt/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Van Allen Belt metrics:", err);
  }

  return NextResponse.json({
    active_belts_count: 3,
    harvest_events_total: 1,
    total_baseload_dispatch_gw: 10.2,
    mean_betatron_efficiency_pct: 99.03,
    betatron_coupling_status: "VAN_ALLEN_BETATRON_LOCKED",
  });
}
