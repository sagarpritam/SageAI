import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  stacks: [
    {
      stack_id: "SATAKE-PGL2-GR-01",
      classification: "PGL(2) Affine Grassmannian Gr_G & Langlands Dual Rep(SL2) Perverse Sheaf",
      default_group_rank: 4,
      default_strata_dimension: 12,
      default_springer_fiber_depth: 6,
      base_unitarity_pct: 99.9989,
      base_suppression_db: 167.2,
      status: "GEOMETRIC_SATAKE_LOCKED",
    },
    {
      stack_id: "SATAKE-E8-ENDOSCOPY-02",
      classification: "Exceptional E8 Affine Springer Fiber & Arthur-Selberg Endoscopic Transfer",
      default_group_rank: 6,
      default_strata_dimension: 18,
      default_springer_fiber_depth: 10,
      base_unitarity_pct: 99.9997,
      base_suppression_db: 169.3,
      status: "GEOMETRIC_SATAKE_LOCKED",
    },
    {
      stack_id: "SATAKE-LANGLANDS-DMOD-03",
      classification: "Automorphic D-Module Hecke Eigensheaf & Global Nilpotent Cone Stratification",
      default_group_rank: 8,
      default_strata_dimension: 24,
      default_springer_fiber_depth: 14,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 171.5,
      status: "GEOMETRIC_SATAKE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/geometric-satake-affine/stacks`,
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
