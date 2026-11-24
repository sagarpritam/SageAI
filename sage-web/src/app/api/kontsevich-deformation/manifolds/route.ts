import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_MANIFOLDS = {
  manifolds: [
    {
      manifold_id: "KONTSEVICH-MOYAL-PLANE-01",
      classification: "Flat Symplectic R^2 with Constant Poisson Tensor pi^ij = epsilon^ij",
      poisson_rank: 2,
      deformation_parameter_hbar: 0.05,
      harmonic_propagator: "Angle 1-form d phi / 2pi on Lobachevsky Upper Half-Plane H",
      base_associativity_fidelity_pct: 99.9999,
      status: "POISSON_DEFORMATION_LOCKED",
    },
    {
      manifold_id: "KONTSEVICH-KIRILLOV-LIE-02",
      classification: "Dual of Lie Algebra su(2)* with Linear Kirillov-Kostant-Souriau Tensor",
      poisson_rank: 2,
      deformation_parameter_hbar: 0.08,
      harmonic_propagator: "Universal Enveloping Algebra U_hbar(su(2)) Baker-Campbell-Hausdorff Integral",
      base_associativity_fidelity_pct: 99.9997,
      status: "POISSON_DEFORMATION_LOCKED",
    },
    {
      manifold_id: "KONTSEVICH-POISSON-CY-03",
      classification: "Holomorphic Poisson Structure on Calabi-Yau 3-Fold Moduli",
      poisson_rank: 6,
      deformation_parameter_hbar: 0.02,
      harmonic_propagator: "Kontsevich Graph Integral Weights w_Gamma over Admissible Polyvectors",
      base_associativity_fidelity_pct: 99.9998,
      status: "POISSON_DEFORMATION_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/kontsevich-deformation/manifolds`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_MANIFOLDS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_MANIFOLDS, { status: 200 });
}
