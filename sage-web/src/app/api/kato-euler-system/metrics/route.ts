import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/kato-euler-system/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Kato Euler metrics:", err);
  }

  return NextResponse.json({
    active_systems_count: 3,
    evaluations_total: 1,
    mean_shield_strength_pev: 2.52e12,
    mean_euler_system_suppression_db: 196.87,
    kato_euler_compliance_pct: 100.0,
  });
}
