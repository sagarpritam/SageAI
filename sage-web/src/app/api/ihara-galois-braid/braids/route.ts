import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/ihara-galois-braid/braids`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Ihara Galois braid profiles:", err);
  }

  return NextResponse.json({
    braids: [
      {
        braid_id: "IHARA-P1-MINUS3-01",
        name: "Ihara P^1 \\ {0,1,inf} Profinite Galois Braid",
        fundamental_group: "pi_1^et(P^1 - {0,1,inf})",
        gt_hat_cocycle_defect: 1e-18,
        ihara_shield_strength_pev: 1.9e12,
        braid_monodromy_suppression_db: 190.4,
        status: "IHARA_GALOIS_BRAID_LOCKED",
      },
      {
        braid_id: "IHARA-GT-HAT-ASSOCIATOR-02",
        name: "Grothendieck-Teichmuller GT-hat Associator Shield",
        fundamental_group: "GT-hat -> Out(F_2-hat)",
        gt_hat_cocycle_defect: 2e-18,
        ihara_shield_strength_pev: 2.1e12,
        braid_monodromy_suppression_db: 191.2,
        status: "IHARA_GALOIS_BRAID_LOCKED",
      },
      {
        braid_id: "IHARA-NAKAMURA-MODULI-03",
        name: "Nakamura Moduli M_{0,n} Profinite Braid Tower",
        fundamental_group: "pi_1^geom(M_{0,5})",
        gt_hat_cocycle_defect: 1.5e-18,
        ihara_shield_strength_pev: 2.0e12,
        braid_monodromy_suppression_db: 190.8,
        status: "IHARA_GALOIS_BRAID_LOCKED",
      },
    ],
  });
}
