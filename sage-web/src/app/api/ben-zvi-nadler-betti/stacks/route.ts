import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ben-zvi-nadler-betti/stacks`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Ben-Zvi-Nadler stacks:", err);
    return NextResponse.json({
      stacks: [
        {
          stack_id: "BENZVI-NADLER-BETTI-01",
          spectral_stack: "LocSys_G^Betti(Sigma)",
          nilpotent_cone_rank: 3,
          singular_support_order: 2,
          betti_defect: 0.0,
          bzn_barrier_strength_pev: 4.22e12,
          betti_langlands_suppression_db: 212.95,
          spectral_state: "BEN_ZVI_NADLER_BETTI_LOCKED",
        },
        {
          stack_id: "BENZVI-NADLER-COH-02",
          spectral_stack: "IndCoh_N(LocSys_G)",
          nilpotent_cone_rank: 4,
          singular_support_order: 3,
          betti_defect: 0.0,
          bzn_barrier_strength_pev: 4.36e12,
          betti_langlands_suppression_db: 213.75,
          spectral_state: "BEN_ZVI_NADLER_BETTI_LOCKED",
        },
        {
          stack_id: "BENZVI-NADLER-TRACE-03",
          spectral_stack: "HH_*(Shv_N(Bun_G))",
          nilpotent_cone_rank: 5,
          singular_support_order: 4,
          betti_defect: 0.0,
          bzn_barrier_strength_pev: 4.5e12,
          betti_langlands_suppression_db: 214.6,
          spectral_state: "BEN_ZVI_NADLER_BETTI_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
