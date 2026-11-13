import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  invariants: [
    {
      invariant_id: "GW-QUINTIC-CY3-01",
      classification: "Gromov-Witten Genus-0/1 Quintic 3-Fold Stable Map Invariant",
      default_curve_genus: 0,
      default_marked_points: 14,
      default_novikov_degree: 12,
      base_unitarity_pct: 99.9989,
      base_suppression_db: 166.1,
      status: "WDVV_RELATIONS_LOCKED",
    },
    {
      invariant_id: "QUANTUM-K-GRASSMANN-02",
      classification: "Quantum K-Theory Grassmannian Gr(3,7) Virtual Structure Sheaf",
      default_curve_genus: 1,
      default_marked_points: 18,
      default_novikov_degree: 16,
      base_unitarity_pct: 99.9995,
      base_suppression_db: 168.0,
      status: "WDVV_RELATIONS_LOCKED",
    },
    {
      invariant_id: "WDVV-QUANTUM-RING-03",
      classification: "WDVV Associativity Quantum Cohomology Ring QH*(M) & Givental J-Function",
      default_curve_genus: 2,
      default_marked_points: 24,
      default_novikov_degree: 22,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 170.1,
      status: "WDVV_RELATIONS_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/quantum-gromov-witten/invariants`,
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
