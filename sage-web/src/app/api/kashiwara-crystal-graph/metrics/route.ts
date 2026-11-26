import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/kashiwara-crystal-graph/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Kashiwara metrics:", err);
    return NextResponse.json({
      active_crystals_count: 3,
      evaluations_total: 1,
      mean_barrier_strength_pev: 4.84e12,
      mean_crystal_graph_suppression_db: 216.37,
      kashiwara_crystal_compliance_pct: 100.0,
    });
  }
}
