import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  algebras: [
    {
      algebra_id: "SUBFACTOR-JONES-E8-01",
      classification: "Type II_1 E8 Principal Graph Subfactor (Jones Level k=28)",
      default_jones_level_k: 28,
      default_tangle_boxes: 16,
      default_tl_strands: 12,
      base_unitarity_pct: 99.997,
      base_suppression_db: 161.6,
      status: "SUBFACTOR_TANGLE_LOCKED",
    },
    {
      algebra_id: "TEMPERLEY-LIEB-SU2-02",
      classification: "Temperley-Lieb Affine TL_n Quantum SU(2)_k Planar Cage",
      default_jones_level_k: 14,
      default_tangle_boxes: 24,
      default_tl_strands: 16,
      base_unitarity_pct: 99.998,
      base_suppression_db: 163.8,
      status: "SUBFACTOR_TANGLE_LOCKED",
    },
    {
      algebra_id: "HAAGERUP-BIUNITARY-03",
      classification: "Exotic Haagerup (5+sqrt(13))/2 Biunitary Planar Connection",
      default_jones_level_k: 18,
      default_tangle_boxes: 32,
      default_tl_strands: 20,
      base_unitarity_pct: 99.999,
      base_suppression_db: 166.3,
      status: "SUBFACTOR_TANGLE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/subfactor-jones-planars/algebras`,
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

