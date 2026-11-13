import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  algebras: [
    {
      algebra_id: "CHIRAL-SL2-AFFINE-01",
      classification: "Affine Kac-Moody sl(2)_k Chiral Algebra & KZ Flat Connection",
      default_algebra_level_k: 4,
      default_curve_points_n: 4,
      default_factorization_depth: 6,
      base_unitarity_pct: 99.9988,
      base_suppression_db: 167.0,
      status: "CHIRAL_FACTORIZATION_LOCKED",
    },
    {
      algebra_id: "BD-GRASSMANNIAN-SL4-02",
      classification: "Beilinson-Drinfeld Grassmannian Gr_SL4 & Chiral Homology Complex",
      default_algebra_level_k: 6,
      default_curve_points_n: 8,
      default_factorization_depth: 10,
      base_unitarity_pct: 99.9996,
      base_suppression_db: 169.0,
      status: "CHIRAL_FACTORIZATION_LOCKED",
    },
    {
      algebra_id: "VIRASORO-W3-CHIRAL-03",
      classification: "Virasoro-W3 Conformal Block Sheaf & Chiral Operadic Envelope",
      default_algebra_level_k: 8,
      default_curve_points_n: 12,
      default_factorization_depth: 14,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 171.2,
      status: "CHIRAL_FACTORIZATION_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/beilinson-drinfeld-chiral/algebras`,
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
