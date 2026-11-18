import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  categories: [
    {
      category_id: "TANNAKA-MOTIVE-NUM-01",
      classification: "Numerical Equivalence Motives Tannakian Category & Fiber Functor",
      default_tannakian_rank: 4,
      default_period_dimension: 8,
      default_hodge_weight: 2,
      base_unitarity_pct: 99.9991,
      base_suppression_db: 169.5,
      status: "TANNAKIAN_CATEGORY_LOCKED",
    },
    {
      category_id: "GALOIS-MOTIVIC-PROG-02",
      classification: "Pro-Algebraic Motivic Galois Group Representation & Mumford-Tate Group",
      default_tannakian_rank: 6,
      default_period_dimension: 12,
      default_hodge_weight: 4,
      base_unitarity_pct: 99.9997,
      base_suppression_db: 172.0,
      status: "TANNAKIAN_CATEGORY_LOCKED",
    },
    {
      category_id: "PERIOD-LATTICE-TRANSC-03",
      classification: "Grothendieck Period Ring Transcendental Lattice & Kontsevich-Zagier Isomorphism",
      default_tannakian_rank: 8,
      default_period_dimension: 16,
      default_hodge_weight: 6,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 174.5,
      status: "TANNAKIAN_CATEGORY_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/tannakian-motivic-shield/categories`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_DATA);
}

