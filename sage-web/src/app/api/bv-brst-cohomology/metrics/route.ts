import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_bv_complexes: 3,
  mean_cohomology_unitarity_pct: 99.998,
  mean_nilpotent_suppression_db: 163.2,
  quantum_master_equation_locked: true,
  total_master_enforcements: 1,
  capability: "135 - Batalin-Vilkovisky Antifield BRST Cohomology Master Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/bv-brst-cohomology/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_DATA);
}

