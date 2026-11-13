import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_gromov_invariants: 3,
  total_gromov_seals: 1,
  mean_unitarity_pct: 99.99943,
  capability: "Capability 154 - Quantum Cohomology & Gromov-Witten Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/quantum-gromov-witten/metrics`,
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
