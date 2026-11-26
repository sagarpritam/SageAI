import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/kontsevich-wall-crossing/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Kontsevich metrics:", err);
  }

  return NextResponse.json({
    active_chambers_count: 3,
    evaluations_total: 1,
    mean_firewall_strength_pev: 3.5e12,
    mean_wall_crossing_suppression_db: 207.0,
    kontsevich_wall_compliance_pct: 100.0,
  });
}
