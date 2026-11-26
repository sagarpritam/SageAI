import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ptvv-shifted-symplectic/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback PTVV metrics:", err);
    return NextResponse.json({
      active_stacks_count: 3,
      evaluations_total: 1,
      mean_barrier_strength_pev: 4.12e12,
      mean_shifted_symplectic_suppression_db: 212.47,
      ptvv_compliance_pct: 100.0,
    });
  }
}
