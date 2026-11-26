import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chuang-rouquier-sl2/complexes`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Chuang-Rouquier complexes:", err);
    return NextResponse.json({
      complexes: [
        {
          complex_id: "CHUANG-ROUQUIER-SL2-01",
          equivalence_type: "Broue Abelian Defect",
          rickard_complex_terms: 4,
          perverse_shift_p: 2,
          derived_defect: 0.0,
          cr_firewall_strength_pev: 4.52e12,
          sl2_categorification_suppression_db: 214.7,
          equivalence_state: "CHUANG_ROUQUIER_SL2_LOCKED",
        },
        {
          complex_id: "CHUANG-ROUQUIER-SYMMETRIC-02",
          equivalence_type: "Block D^b(S_n-mod)",
          rickard_complex_terms: 6,
          perverse_shift_p: 3,
          derived_defect: 0.0,
          cr_firewall_strength_pev: 4.66e12,
          sl2_categorification_suppression_db: 215.5,
          equivalence_state: "CHUANG_ROUQUIER_SL2_LOCKED",
        },
        {
          complex_id: "CHUANG-ROUQUIER-SPLENDID-03",
          equivalence_type: "Splendid Rickard Complex",
          rickard_complex_terms: 8,
          perverse_shift_p: 4,
          derived_defect: 0.0,
          cr_firewall_strength_pev: 4.8e12,
          sl2_categorification_suppression_db: 216.35,
          equivalence_state: "CHUANG_ROUQUIER_SL2_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
