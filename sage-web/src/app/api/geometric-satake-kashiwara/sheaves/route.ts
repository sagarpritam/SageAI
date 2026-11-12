import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  sheaves: [
    {
      sheaf_id: "SATAKE-MV-SL4-01",
      classification: "Mirkovic-Vilonen Affine Grassmannian Gr_{SL4} Perverse Sheaf",
      default_lie_rank: 4,
      default_crystal_depth: 14,
      default_polytope_vertices: 12,
      base_unitarity_pct: 99.9979,
      base_suppression_db: 163.5,
      status: "SATAKE_CRYSTAL_LOCKED",
    },
    {
      sheaf_id: "KASHIWARA-B8-CRYSTAL-02",
      classification: "Kashiwara Affine Crystal Basis Lattice U_q(E_8)",
      default_lie_rank: 8,
      default_crystal_depth: 18,
      default_polytope_vertices: 16,
      base_unitarity_pct: 99.9987,
      base_suppression_db: 165.4,
      status: "SATAKE_CRYSTAL_LOCKED",
    },
    {
      sheaf_id: "LUSZTIG-IC-G2-03",
      classification: "Lusztig Canonical Basis & Intersection Cohomology IC Sheaf",
      default_lie_rank: 6,
      default_crystal_depth: 24,
      default_polytope_vertices: 20,
      base_unitarity_pct: 99.9994,
      base_suppression_db: 167.5,
      status: "SATAKE_CRYSTAL_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/geometric-satake-kashiwara/sheaves`,
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

