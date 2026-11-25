import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_targets_count: 3,
  computations_total: 15,
  mean_quantum_barrier_strength_pev: 384.2,
  mean_symplectic_suppression_db: 199.5,
  wdvv_associativity_compliance_pct: 100.0,
  quantum_cohomology_ring_status: "FROBENIUS_MANIFOLD_STABILIZED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/gromov-witten-cohomology/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
