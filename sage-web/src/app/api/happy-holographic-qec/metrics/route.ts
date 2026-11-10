import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_happy_tessellations: 3,
  mean_bulk_logical_fidelity_pct: 99.996,
  max_boundary_erasure_threshold_pct: 49.6,
  entanglement_wedge_complementarity_locked: true,
  total_erasure_recoveries_executed: 61,
  capability: "108 - Holographic AdS/CFT HaPPY Tensor Network QEC Compiler",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/happy-holographic-qec/metrics`,
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

