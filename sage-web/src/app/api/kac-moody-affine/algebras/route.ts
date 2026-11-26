import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/kac-moody-affine/algebras`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Kac-Moody algebras:", err);
    return NextResponse.json({
      algebras: [
        {
          algebra_id: "KAC-MOODY-AFFINE-01",
          cartan_type: "A_n^(1) Untwisted Affine",
          central_level_k: 2,
          imaginary_root_mult: 4,
          weyl_kac_defect: 0.0,
          km_shield_strength_pev: 4.88e12,
          kac_moody_suppression_db: 216.4,
          algebra_state: "KAC_MOODY_AFFINE_LOCKED",
        },
        {
          algebra_id: "KAC-MOODY-TWISTED-02",
          cartan_type: "D_4^(3) Triality Twisted",
          central_level_k: 3,
          imaginary_root_mult: 6,
          weyl_kac_defect: 0.0,
          km_shield_strength_pev: 5.02e12,
          kac_moody_suppression_db: 217.2,
          algebra_state: "KAC_MOODY_AFFINE_LOCKED",
        },
        {
          algebra_id: "KAC-MOODY-HYPERBOLIC-03",
          cartan_type: "E_10 Hyperbolic Kac-Moody",
          central_level_k: 4,
          imaginary_root_mult: 8,
          weyl_kac_defect: 0.0,
          km_shield_strength_pev: 5.16e12,
          kac_moody_suppression_db: 218.05,
          algebra_state: "KAC_MOODY_AFFINE_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
