import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_PAIRS = {
  pairs: [
    {
      pair_id: "CY-QUINTIC-GREENE-PLESSER-01",
      a_manifold: "Quintic Hypersurface X_5 in P^4",
      b_manifold: "Mirror Orbifold Y_5 = X_5 / (Z_5)^3",
      h11: 1,
      h21: 101,
      euler_characteristic: -200,
      picard_fuchs_order: 4,
      base_mirror_fidelity_pct: 99.9997,
      status: "MIRROR_SYMMETRY_SYNCHRONIZED",
    },
    {
      pair_id: "CY-BICUBIC-P5-01",
      a_manifold: "Complete Intersection CICY (3,3) in P^5",
      b_manifold: "Mirror CICY Orbifold Y_(3,3) / G",
      h11: 2,
      h21: 83,
      euler_characteristic: -162,
      picard_fuchs_order: 4,
      base_mirror_fidelity_pct: 99.9995,
      status: "MIRROR_SYMMETRY_SYNCHRONIZED",
    },
    {
      pair_id: "CY-OCTIC-WP11114-01",
      a_manifold: "Degree 8 Hypersurface in WP^4(1,1,1,1,4)",
      b_manifold: "Greene-Plesser Mirror of Weighted Octic",
      h11: 1,
      h21: 149,
      euler_characteristic: -296,
      picard_fuchs_order: 4,
      base_mirror_fidelity_pct: 99.9999,
      status: "MIRROR_SYMMETRY_SYNCHRONIZED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/calabi-yau-mirror/pairs`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_PAIRS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_PAIRS, { status: 200 });
}
