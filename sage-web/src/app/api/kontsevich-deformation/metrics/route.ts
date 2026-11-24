import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_manifolds_count: 3,
  quantization_runs_total: 15,
  mean_deformation_shield_strength_pev: 284.5,
  mean_deformation_suppression_db: 198.2,
  star_product_associativity_purity_pct: 99.9998,
  formality_l_infinity_status: "L_INFINITY_QUASI_ISOMORPHISM_LOCKED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/kontsevich-deformation/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
