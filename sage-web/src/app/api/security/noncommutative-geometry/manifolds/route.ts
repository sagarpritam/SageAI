import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/noncommutative-geometry/manifolds", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Noncommutative Geometry manifolds:", err);
    return NextResponse.json([
      {
        manifold_id: "NCGS-MANIFOLD-CONNES-SM",
        spacetime_geometry: "ALMOST_COMMUTATIVE_M4_X_FINITE",
        gauge_algebra: "C_PLUS_H_PLUS_M3_C",
        dirac_eigenvalue_cutoff_gev: 1.0e16,
        spectral_action_joules: 4.8e-12,
        status: "HIGGS_YANG_MILLS_UNIFIED",
      },
      {
        manifold_id: "NCGS-MANIFOLD-DIRAC-COMPACT",
        spacetime_geometry: "NONCOMMUTATIVE_FOUR_TORUS_THETA",
        gauge_algebra: "MOYAL_STAR_PRODUCT_ALGEBRA",
        dirac_eigenvalue_cutoff_gev: 2.5e15,
        spectral_action_joules: 3.2e-12,
        status: "MORITA_EQUIVALENCE_VERIFIED",
      },
      {
        manifold_id: "NCGS-MANIFOLD-DIXMIER-TRACE",
        spacetime_geometry: "QUANTIZED_PHASE_SPACE_COTANGENT",
        gauge_algebra: "COMPACT_RESOLVENT_OPERATOR_ALGEBRA",
        dirac_eigenvalue_cutoff_gev: 5.0e15,
        spectral_action_joules: 2.1e-12,
        status: "DIXMIER_LOGARITHMIC_FINITE",
      },
      {
        manifold_id: "NCGS-MANIFOLD-KO-DIMENSION-8",
        spacetime_geometry: "CLIFFORD_MODULE_REAL_STRUCTURE",
        gauge_algebra: "POINCARE_DUALITY_HOMOLOGY",
        dirac_eigenvalue_cutoff_gev: 8.0e15,
        spectral_action_joules: 6.5e-12,
        status: "FERMIONIC_SIGNS_PRESERVED",
      },
    ]);
  }
}
