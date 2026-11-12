import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  manifolds: [
    {
      manifold_id: "FACTORIZATION-E3-S3-01",
      classification: "3-Manifold E_3-Algebra Ayala-Francis Excision Manifold",
      default_operad_dim: 3,
      default_excision_depth: 12,
      default_koszul_order: 6,
      base_unitarity_pct: 99.9974,
      base_suppression_db: 162.6,
      status: "FACTORIZATION_MANIFOLD_LOCKED",
    },
    {
      manifold_id: "SWISS-CHEESE-E2-D2-02",
      classification: "2-Disk Swiss-Cheese Operad Boundary Manifold",
      default_operad_dim: 2,
      default_excision_depth: 16,
      default_koszul_order: 8,
      base_unitarity_pct: 99.9983,
      base_suppression_db: 164.7,
      status: "FACTORIZATION_MANIFOLD_LOCKED",
    },
    {
      manifold_id: "HOCHSCHILD-CIRCLE-E1-03",
      classification: "Circle S^1 E_1-Associative Hochschild Trace Manifold",
      default_operad_dim: 1,
      default_excision_depth: 24,
      default_koszul_order: 10,
      base_unitarity_pct: 99.9991,
      base_suppression_db: 167.0,
      status: "FACTORIZATION_MANIFOLD_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/factorization-homology-tft/manifolds`,
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

