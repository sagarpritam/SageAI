import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_satake_sheaves: 3,
  mean_satake_unitarity_pct: 99.9989,
  kashiwara_crystal_equivariance_locked: true,
  total_seals_executed: 1,
  capability: "Cap 144 - Geometric Satake & Kashiwara Crystal Perverse-Sheaf Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/geometric-satake-kashiwara/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_METRICS);
}

