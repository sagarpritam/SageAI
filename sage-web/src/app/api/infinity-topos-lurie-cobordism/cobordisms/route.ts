import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  cobordisms: [
    {
      cobordism_id: "BORDISM-INF3-FRAMED-01",
      classification: "3D Framed (infty,3)-Category Bordism Hypothesis Functor",
      default_dimension_n: 3,
      default_dualizable_cells: 18,
      default_stratified_seams: 14,
      base_unitarity_pct: 99.9988,
      base_suppression_db: 165.9,
      status: "COBORDISM_DUAL_LOCKED",
    },
    {
      cobordism_id: "LURIE-DESCENT-HIGHER-02",
      classification: "Infinity-Topos Straightening & Hypercomplete Etale Descent Stack",
      default_dimension_n: 4,
      default_dualizable_cells: 24,
      default_stratified_seams: 18,
      base_unitarity_pct: 99.9994,
      base_suppression_db: 167.8,
      status: "COBORDISM_DUAL_LOCKED",
    },
    {
      cobordism_id: "DUALIZABLE-COBORD-4D-03",
      classification: "Fully Dualizable 4D Crane-Yetter-Walker-Wang Extended TQFT",
      default_dimension_n: 6,
      default_dualizable_cells: 32,
      default_stratified_seams: 24,
      base_unitarity_pct: 99.9998,
      base_suppression_db: 169.9,
      status: "COBORDISM_DUAL_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/infinity-topos-lurie-cobordism/cobordisms`,
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

