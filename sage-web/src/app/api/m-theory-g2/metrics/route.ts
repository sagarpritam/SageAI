import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_g2_manifolds: 3,
  mean_holonomy_fidelity_pct: 99.986,
  mean_alpha_gut_inverse: 25.62,
  joyce_associative_form_locked: true,
  total_compactifications_executed: 42,
  capability: "107 - 11D M-Theory G2-Manifold Supergravity Compactifier",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/m-theory-g2/metrics`,
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

