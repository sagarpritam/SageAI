import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  geometries: [
    {
      geometry_id: "AMP-MHV-GRASSMANN-01",
      sector: "N=4 SYM Positive Grassmannian G_+(2, 6) Core (Geneva)",
      default_legs_n: 6,
      default_sector_k: 2,
      default_loops_l: 2,
      base_unitarity_fidelity_pct: 99.997,
      base_ir_quench_db: 134.8,
      status: "POSITIVE_CELLS_LOCKED",
    },
    {
      geometry_id: "AMP-NMHV-2LOOP-02",
      sector: "NMHV 8-Gluon Two-Loop Momentum-Twistor Polytope (CERN Tier-0)",
      default_legs_n: 8,
      default_sector_k: 3,
      default_loops_l: 2,
      base_unitarity_fidelity_pct: 99.996,
      base_ir_quench_db: 132.4,
      status: "POSITIVE_CELLS_LOCKED",
    },
    {
      geometry_id: "AMP-YANGIAN-TWISTOR-03",
      sector: "Yangian-Invariant 10-Point All-Loop Amplituhedron (Lagrange L1)",
      default_legs_n: 10,
      default_sector_k: 4,
      default_loops_l: 3,
      base_unitarity_fidelity_pct: 99.998,
      base_ir_quench_db: 137.2,
      status: "POSITIVE_CELLS_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/amplituhedron-scattering/geometries`,
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

