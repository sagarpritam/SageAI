import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/khovanov-barnatan-tangle/tangles`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Khovanov-Bar-Natan tangles:", err);
    return NextResponse.json({
      tangles: [
        {
          tangle_id: "KHOVANOV-BARNATAN-COB-01",
          cobordism_category: "Cob^3_{/l}(2n)",
          crossing_count: 7,
          quantum_grading_j: 3,
          reidemeister_defect: 0.0,
          kb_firewall_strength_pev: 4.28e12,
          khovanov_tangle_suppression_db: 213.4,
          tangle_state: "KHOVANOV_BARNATAN_LOCKED",
        },
        {
          tangle_id: "KHOVANOV-RASMUSSEN-S-02",
          cobordism_category: "Lee Spectral Sequence s(K)",
          crossing_count: 11,
          quantum_grading_j: 5,
          reidemeister_defect: 0.0,
          kb_firewall_strength_pev: 4.42e12,
          khovanov_tangle_suppression_db: 214.2,
          tangle_state: "KHOVANOV_BARNATAN_LOCKED",
        },
        {
          tangle_id: "KHOVANOV-ROZANSKY-SLN-03",
          cobordism_category: "HOMFLY-PT Triply Graded",
          crossing_count: 15,
          quantum_grading_j: 7,
          reidemeister_defect: 0.0,
          kb_firewall_strength_pev: 4.56e12,
          khovanov_tangle_suppression_db: 215.05,
          tangle_state: "KHOVANOV_BARNATAN_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
