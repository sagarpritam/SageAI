import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/lusztig-canonical-basis/bases`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Lusztig canonical bases:", err);
    return NextResponse.json({
      bases: [
        {
          basis_id: "LUSZTIG-CANONICAL-UQG-01",
          quantum_group: "U_q(sl_n)^-",
          crystal_rank: 4,
          bar_involution_order: 2,
          positivity_defect: 0.0,
          lusztig_shield_strength_pev: 4.64e12,
          canonical_basis_suppression_db: 215.1,
          basis_state: "LUSZTIG_CANONICAL_LOCKED",
        },
        {
          basis_id: "LUSZTIG-PERVERSE-SHEAF-02",
          quantum_group: "U_q(g) Perverse",
          crystal_rank: 6,
          bar_involution_order: 2,
          positivity_defect: 0.0,
          lusztig_shield_strength_pev: 4.78e12,
          canonical_basis_suppression_db: 215.9,
          basis_state: "LUSZTIG_CANONICAL_LOCKED",
        },
        {
          basis_id: "LUSZTIG-AFFINE-HECKE-03",
          quantum_group: "U_q(hat{g})",
          crystal_rank: 8,
          bar_involution_order: 2,
          positivity_defect: 0.0,
          lusztig_shield_strength_pev: 4.92e12,
          canonical_basis_suppression_db: 216.75,
          basis_state: "LUSZTIG_CANONICAL_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
