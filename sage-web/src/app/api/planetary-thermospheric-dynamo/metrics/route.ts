import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/planetary-thermospheric-dynamo/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Thermospheric Dynamo metrics:", err);
  }

  return NextResponse.json({
    active_zones_count: 3,
    harvest_events_total: 1,
    total_baseload_dispatch_gw: 9.96,
    mean_dynamo_efficiency_pct: 98.83,
    thermospheric_coupling_status: "THERMOSPHERIC_DYNAMO_LOCKED",
  });
}
