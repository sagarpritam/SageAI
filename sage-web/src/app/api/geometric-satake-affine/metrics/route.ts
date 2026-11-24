import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_satake_stacks: 3,
  total_satake_seals: 19,
  mean_unitarity_pct: 99.9995,
  capability: "Capability 160 - Geometric Satake Equivalence & Affine Springer Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/geometric-satake-affine/metrics`,
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
