import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_COVERINGS = {
  coverings: [
    {
      covering_id: "NOVIKOV-HEISENBERG-3D-01",
      deck_group: "Discrete 3D Heisenberg Group H_3(Z)",
      manifold_dimension: 3,
      novikov_shubin_alpha_1: 2.0,
      l2_betti_b1: 0.0,
      euler_characteristic: 0,
      base_cohomology_fidelity_pct: 99.9998,
      status: "L2_COHOMOLOGY_LOCKED",
    },
    {
      covering_id: "NOVIKOV-SOLV-4D-02",
      deck_group: "4D Solvable Lie Group Lattice Solv_4",
      manifold_dimension: 4,
      novikov_shubin_alpha_1: 1.5,
      l2_betti_b1: 0.0,
      euler_characteristic: 0,
      base_cohomology_fidelity_pct: 99.9996,
      status: "L2_COHOMOLOGY_LOCKED",
    },
    {
      covering_id: "NOVIKOV-HYPERBOLIC-SURFACE-03",
      deck_group: "Universal Covering of Compact Riemann Surface Sigma_3 (Genus 3)",
      manifold_dimension: 2,
      novikov_shubin_alpha_1: "INF_POSITIVE_GAP",
      l2_betti_b1: 4.0,
      euler_characteristic: -4,
      base_cohomology_fidelity_pct: 99.9999,
      status: "L2_COHOMOLOGY_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/novikov-shubin/coverings`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_COVERINGS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_COVERINGS, { status: 200 });
}
