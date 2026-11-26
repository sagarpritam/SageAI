import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/elias-williamson-soergel/bimodules`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Elias-Williamson bimodules:", err);
    return NextResponse.json({
      bimodules: [
        {
          bimodule_id: "ELIAS-WILLIAMSON-SOERGEL-01",
          coxeter_group: "S_n Symmetric Coxeter",
          hodge_lefschetz_rank: 3,
          bott_samelson_length: 5,
          hodge_riemann_defect: 0.0,
          soergel_barrier_strength_pev: 4.46e12,
          soergel_suppression_db: 214.25,
          positivity_state: "ELIAS_WILLIAMSON_SOERGEL_LOCKED",
        },
        {
          bimodule_id: "ELIAS-WILLIAMSON-AFFINE-02",
          coxeter_group: "Affine Weyl W_aff",
          hodge_lefschetz_rank: 4,
          bott_samelson_length: 7,
          hodge_riemann_defect: 0.0,
          soergel_barrier_strength_pev: 4.6e12,
          soergel_suppression_db: 215.1,
          positivity_state: "ELIAS_WILLIAMSON_SOERGEL_LOCKED",
        },
        {
          bimodule_id: "ELIAS-WILLIAMSON-DIAGRAM-03",
          coxeter_group: "Diagrammatic Hecke H_W",
          hodge_lefschetz_rank: 5,
          bott_samelson_length: 9,
          hodge_riemann_defect: 0.0,
          soergel_barrier_strength_pev: 4.74e12,
          soergel_suppression_db: 215.95,
          positivity_state: "ELIAS_WILLIAMSON_SOERGEL_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
