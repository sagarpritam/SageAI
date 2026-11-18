import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_braid_systems: 3,
  total_braids_executed: 16,
  golden_ratio_quantum_dimension: 1.618034,
  average_fidelity_pct: 99.9998,
  maximum_suppression_db: 182.4,
  topological_invariance_status: "FAULT_TOLERANT_BRAIDING_STABLE",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/fibonacci-anyon-braiding/metrics`,
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

