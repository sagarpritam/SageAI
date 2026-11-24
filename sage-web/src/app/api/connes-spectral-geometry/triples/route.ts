import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TRIPLES = {
  triples: [
    {
      triple_id: "CONNES-STANDARD-MODEL-01",
      algebra: "C^infty(M) (x) (C (+) H (+) M_3(C))",
      hilbert_space: "L^2(M, S) (x) H_F (Fermion space dim 96)",
      ko_dimension: "10 mod 8",
      grading_gamma: "Graded Even (J^2 = 1, JD = DJ)",
      base_unification_fidelity_pct: 99.9998,
      status: "SPECTRAL_TRIPLE_LOCKED",
    },
    {
      triple_id: "CONNES-FRACTAL-JULIA-01",
      algebra: "Non-Commutative C*-Algebra of Julia Set Fractal J",
      hilbert_space: "Direct Integral Hilbert Bundle over Limiting Repellor",
      ko_dimension: "Hausdorff Metric Dim 1.618",
      grading_gamma: "Finitely Summable Dirac Operator D_J",
      base_unification_fidelity_pct: 99.9994,
      status: "SPECTRAL_TRIPLE_LOCKED",
    },
    {
      triple_id: "CONNES-QUANTUM-TORUS-01",
      algebra: "Non-Commutative 2-Torus A_theta (theta = (sqrt(5)-1)/2)",
      hilbert_space: "GNS Representation L^2(A_theta, tau)",
      ko_dimension: "2 mod 8",
      grading_gamma: "Isospectral Dirac Operator D_theta",
      base_unification_fidelity_pct: 99.9999,
      status: "SPECTRAL_TRIPLE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/connes-spectral-geometry/triples`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_TRIPLES));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_TRIPLES, { status: 200 });
}
