import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/planetary-mesospheric-plasma/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Mesospheric Plasma metrics:", err);
  }

  return NextResponse.json({
    active_layers_count: 3,
    harvest_events_total: 1,
    total_baseload_dispatch_gw: 9.84,
    mean_plasma_efficiency_pct: 98.73,
    mesospheric_coupling_status: "MESOSPHERIC_PLASMA_LOCKED",
  });
}
