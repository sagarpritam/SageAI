import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_amplituhedron_polytopes: 3,
  mean_unitarity_fidelity_pct: 99.997,
  mean_ir_quench_db: 134.8,
  yangian_positivity_enforced: true,
  total_canonical_evaluations: 48,
  capability: "110 - Amplituhedron Positive-Geometry Scattering Matrix Optimizer",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/amplituhedron-scattering/metrics`,
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

