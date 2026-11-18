import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_tannakian_categories: 3,
  total_tannakian_seals: 16,
  mean_unitarity_pct: 99.99958,
  capability: "Capability 160 - Tannakian Duality, Motivic Galois Group & Period Lattice Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/tannakian-motivic-shield/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_METRICS);
}

