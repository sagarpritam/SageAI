import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  complexes: [
    {
      complex_id: "BV-MASTER-YANG-MILLS-01",
      complex_sector: "Yang-Mills Odd Symplectic (-1)-Shifted Cotangent T*[-1]M",
      default_ghost_grading: 2,
      default_bracket_order: 4,
      default_gauge_fermion_xi: 1.2,
      base_unitarity_pct: 99.997,
      base_suppression_db: 160.8,
      status: "BV_BRST_COMPLEX_LOCKED",
    },
    {
      complex_id: "BRST-STRING-FIELD-02",
      complex_sector: "Zwiebach Closed String BV Quantum Master Algebra",
      default_ghost_grading: 3,
      default_bracket_order: 6,
      default_gauge_fermion_xi: 1.5,
      base_unitarity_pct: 99.998,
      base_suppression_db: 163.2,
      status: "BV_BRST_COMPLEX_LOCKED",
    },
    {
      complex_id: "AKSZ-SIGMA-MODEL-03",
      complex_sector: "AKSZ Poisson-Sigma Topological BV Antifield Manifold",
      default_ghost_grading: 4,
      default_bracket_order: 8,
      default_gauge_fermion_xi: 1.8,
      base_unitarity_pct: 99.999,
      base_suppression_db: 165.7,
      status: "BV_BRST_COMPLEX_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/bv-brst-cohomology/complexes`,
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

