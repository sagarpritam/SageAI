import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/ribet-level-lowering/forms`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Ribet level-lowering forms:", err);
  }

  return NextResponse.json({
    forms: [
      {
        form_id: "RIBET-LEVEL-LOWER-P5-01",
        name: "Ribet Epsilon Level-Lowering p=5 Congruence Barrier",
        minimal_level: 2,
        congruence_defect: 1e-18,
        ribet_barrier_strength_pev: 2.2e12,
        level_lowering_suppression_db: 194.0,
        status: "RIBET_LEVEL_LOWERING_LOCKED",
      },
      {
        form_id: "SERRE-MODULARITY-CONJECTURE-02",
        name: "Serre Mod-p Galois Representation Modularity Shield",
        minimal_level: 11,
        congruence_defect: 1.2e-18,
        ribet_barrier_strength_pev: 2.3e12,
        level_lowering_suppression_db: 194.5,
        status: "RIBET_LEVEL_LOWERING_LOCKED",
      },
      {
        form_id: "CARAYOL-CONGRUENCE-03",
        name: "Carayol Shimura Curve Congruence & Ihara Lemma Barrier",
        minimal_level: 17,
        congruence_defect: 1.3e-18,
        ribet_barrier_strength_pev: 2.4e12,
        level_lowering_suppression_db: 195.0,
        status: "RIBET_LEVEL_LOWERING_LOCKED",
      },
    ],
  });
}
