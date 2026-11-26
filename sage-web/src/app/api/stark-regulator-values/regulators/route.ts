import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/stark-regulator-values/regulators`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Stark regulator profiles:", err);
  }

  return NextResponse.json({
    regulators: [
      {
        regulator_id: "STARK-RANK1-ABELIAN-01",
        name: "Rank-1 Abelian Stark Unit & L'(0, chi) Regulator",
        artin_l_order: 1,
        artin_regulator_defect: 1e-18,
        stark_firewall_strength_pev: 2.05e12,
        ray_class_suppression_db: 192.0,
        status: "STARK_REGULATOR_LOCKED",
      },
      {
        regulator_id: "STARK-BRUMER-EXPLICIT-02",
        name: "Brumer-Stark Stickelberger Annihilator Firewall",
        artin_l_order: 1,
        artin_regulator_defect: 1.3e-18,
        stark_firewall_strength_pev: 2.15e12,
        ray_class_suppression_db: 192.4,
        status: "STARK_REGULATOR_LOCKED",
      },
      {
        regulator_id: "STARK-GROSS-PADIC-03",
        name: "Gross p-Adic Stark Regulator & Iwasawa Special Value",
        artin_l_order: 2,
        artin_regulator_defect: 1.5e-18,
        stark_firewall_strength_pev: 2.25e12,
        ray_class_suppression_db: 192.9,
        status: "STARK_REGULATOR_LOCKED",
      },
    ],
  });
}
