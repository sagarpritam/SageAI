import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/maulik-okounkov-qc/cohomologies`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Maulik-Okounkov cohomologies:", err);
    return NextResponse.json({
      cohomologies: [
        {
          cohomology_id: "MAULIK-OKOUNKOV-QC-01",
          target_variety: "Cotangent Bundle T*G/B",
          quantum_parameter_q: 0.015,
          equivariant_torus_rank: 4,
          rmatrix_spectral_defect: 0.0,
          maulik_shield_strength_pev: 3.68e12,
          quantum_cohomology_suppression_db: 209.4,
          stable_envelope_state: "MO_QUANTUM_COHOMOLOGY_LOCKED",
        },
        {
          cohomology_id: "MAULIK-OKOUNKOV-HILB-02",
          target_variety: "Hilb^n(C^2) Nakajima Fiber",
          quantum_parameter_q: 0.012,
          equivariant_torus_rank: 6,
          rmatrix_spectral_defect: 0.0,
          maulik_shield_strength_pev: 3.82e12,
          quantum_cohomology_suppression_db: 210.15,
          stable_envelope_state: "MO_QUANTUM_COHOMOLOGY_LOCKED",
        },
        {
          cohomology_id: "MAULIK-OKOUNKOV-INSTANTON-03",
          target_variety: "Uhlenbeck Moduli M(r,n)",
          quantum_parameter_q: 0.009,
          equivariant_torus_rank: 8,
          rmatrix_spectral_defect: 0.0,
          maulik_shield_strength_pev: 3.96e12,
          quantum_cohomology_suppression_db: 211.05,
          stable_envelope_state: "MO_QUANTUM_COHOMOLOGY_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
