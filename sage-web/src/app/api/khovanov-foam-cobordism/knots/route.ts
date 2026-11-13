import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  knots: [
    {
      knot_id: "KNOT-TREFOIL-KH4-01",
      classification: "Type 3_1 Trefoil Knot Khovanov Complex & Foam Facet",
      default_knot_rank: 4,
      default_crossing_depth: 12,
      default_foam_facets: 14,
      base_unitarity_pct: 99.9985,
      base_suppression_db: 165.4,
      status: "KHOVANOV_CHAINS_LOCKED",
    },
    {
      knot_id: "FIGURE8-FOAM-GR6-02",
      classification: "Type 4_1 Figure-Eight Knot Graded Cube & Foam Seam Lattice",
      default_knot_rank: 6,
      default_crossing_depth: 16,
      default_foam_facets: 22,
      base_unitarity_pct: 99.9993,
      base_suppression_db: 167.2,
      status: "KHOVANOV_CHAINS_LOCKED",
    },
    {
      knot_id: "TORUS-T78-KHCOB-03",
      classification: "Torus Knot T(7,8) Categorified Jones Polytope & Bar-Natan Foam Complex",
      default_knot_rank: 8,
      default_crossing_depth: 22,
      default_foam_facets: 30,
      base_unitarity_pct: 99.9998,
      base_suppression_db: 169.5,
      status: "KHOVANOV_CHAINS_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/khovanov-foam-cobordism/knots`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_DATA);
}
