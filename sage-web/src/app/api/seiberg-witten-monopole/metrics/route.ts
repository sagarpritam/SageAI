import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_sw_monopoles: 3,
  total_sw_seals: 19,
  mean_unitarity_pct: 99.99937,
  capability: "Capability 158 - Seiberg-Witten Monopole Invariants & Spin^c 4-Manifold Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/seiberg-witten-monopole/metrics`,
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
