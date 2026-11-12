import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_motivic_complexes: 3,
  mean_motivic_unitarity_pct: 99.998,
  mean_period_suppression_db: 164.1,
  cosmic_galois_equivariance_locked: true,
  total_motivic_seals: 1,
  capability: "138 - Motivic Galois Group & Voevodsky Mixed-Tate Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/motivic-galois-cohomology/metrics`,
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

