import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/borcherds-moonshine/algebras`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Borcherds Moonshine algebras:", err);
    return NextResponse.json({
      algebras: [
        {
          moonshine_id: "BORCHERDS-MONSTER-VOA-01",
          automorphic_group: "Monster M (V^natural)",
          j_invariant_coeff: 196884,
          denominator_formula_rank: 2,
          moonshine_defect: 0.0,
          borcherds_firewall_strength_pev: 5.0e12,
          moonshine_suppression_db: 217.3,
          moonshine_state: "BORCHERDS_MOONSHINE_LOCKED",
        },
        {
          moonshine_id: "BORCHERDS-CONWAY-02",
          automorphic_group: "Conway Co_0 (V^f_natural)",
          j_invariant_coeff: 4096,
          denominator_formula_rank: 3,
          moonshine_defect: 0.0,
          borcherds_firewall_strength_pev: 5.14e12,
          moonshine_suppression_db: 218.1,
          moonshine_state: "BORCHERDS_MOONSHINE_LOCKED",
        },
        {
          moonshine_id: "BORCHERDS-UMBRAL-03",
          automorphic_group: "Mathieu M_24 Umbral",
          j_invariant_coeff: 90,
          denominator_formula_rank: 4,
          moonshine_defect: 0.0,
          borcherds_firewall_strength_pev: 5.28e12,
          moonshine_suppression_db: 218.95,
          moonshine_state: "BORCHERDS_MOONSHINE_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
