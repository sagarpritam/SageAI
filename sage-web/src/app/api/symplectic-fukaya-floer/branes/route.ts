import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  branes: [
    {
      brane_id: "FUKAYA-AINF-CY3-01",
      classification: "Calabi-Yau 3-Fold Wrapped Fukaya A_infinity Lagrangian Brane",
      default_ainf_order: 5,
      default_holomorphic_disks: 14,
      default_novikov_depth: 12,
      base_unitarity_pct: 99.9981,
      base_suppression_db: 164.2,
      status: "FLOER_BRANE_LOCKED",
    },
    {
      brane_id: "FLOER-NOVIKOV-TORUS-02",
      classification: "Symplectic Torus Novikov-Ring Floer Cohomology Complex",
      default_ainf_order: 7,
      default_holomorphic_disks: 20,
      default_novikov_depth: 18,
      base_unitarity_pct: 99.9989,
      base_suppression_db: 166.1,
      status: "FLOER_BRANE_LOCKED",
    },
    {
      brane_id: "STEIN-LEFSCHETZ-M4-03",
      classification: "Liouville-Stein Lefschetz Fibration Vanishing-Cycle Thimble",
      default_ainf_order: 9,
      default_holomorphic_disks: 28,
      default_novikov_depth: 24,
      base_unitarity_pct: 99.9995,
      base_suppression_db: 168.4,
      status: "FLOER_BRANE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/symplectic-fukaya-floer/branes`,
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

