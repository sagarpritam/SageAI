import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/milnor-norm-residue/symbols`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Milnor symbols:", err);
  }

  return NextResponse.json({
    symbols: [
      {
        symbol_id: "MILNOR-K2-SYMBOL-01",
        name: "Milnor K_2^M(F) Steinberg Symbol & Tame Kernel",
        k_degree_n: 2,
        norm_residue_defect: 1e-18,
        milnor_firewall_strength_pev: 3.1e12,
        steinberg_suppression_db: 203.8,
        status: "MILNOR_K_THEORY_LOCKED",
      },
      {
        symbol_id: "MATSUMOTO-STEINBERG-02",
        name: "Matsumoto Universal Central Extension Firewall",
        k_degree_n: 3,
        norm_residue_defect: 1.1e-18,
        milnor_firewall_strength_pev: 3.2e12,
        steinberg_suppression_db: 204.3,
        status: "MILNOR_K_THEORY_LOCKED",
      },
      {
        symbol_id: "MERKURJEV-SUSLIN-BRAUER-03",
        name: "Merkurjev-Suslin Norm Residue & Brauer Torsion",
        k_degree_n: 4,
        norm_residue_defect: 1.2e-18,
        milnor_firewall_strength_pev: 3.3e12,
        steinberg_suppression_db: 204.8,
        status: "MILNOR_K_THEORY_LOCKED",
      },
    ],
  });
}
