import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  complexes: [
    {
      complex_id: "KR-GL2-HOPF-01",
      classification: "gl(2) Link Homology & Categorified Jones Polynomial Rouquier Complex",
      default_lie_algebra_n: 2,
      default_crossing_number: 2,
      default_filtration_depth: 4,
      base_unitarity_pct: 99.9987,
      base_suppression_db: 167.0,
      status: "ROUQUIER_COMPLEX_LOCKED",
    },
    {
      complex_id: "KR-GL3-TREFOIL-02",
      classification: "gl(3) Matrix Factorization & Triply-Graded Khovanov-Rozansky Invariant",
      default_lie_algebra_n: 3,
      default_crossing_number: 6,
      default_filtration_depth: 8,
      base_unitarity_pct: 99.9993,
      base_suppression_db: 169.2,
      status: "ROUQUIER_COMPLEX_LOCKED",
    },
    {
      complex_id: "KR-GLN-TORUS-03",
      classification: "gl(N) Colored HOMFLY-PT Homology & Soergel Bimodule Categorification",
      default_lie_algebra_n: 5,
      default_crossing_number: 12,
      default_filtration_depth: 16,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 172.5,
      status: "ROUQUIER_COMPLEX_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/khovanov-rozansky-homology/complexes`,
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

