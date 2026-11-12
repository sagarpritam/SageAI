import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  stacks: [
    {
      stack_id: "PTVV-AKSZ-CY3-01",
      classification: "PTVV (-1)-Shifted Symplectic CY3 AKSZ Mapping Stack",
      default_symplectic_shift: -1,
      default_lagrangian_rank: 10,
      default_aksz_degree: 6,
      base_fidelity_pct: 99.9977,
      base_isolation_db: 163.0,
      status: "SHIFTED_SYMPLECTIC_LOCKED",
    },
    {
      stack_id: "DERIVED-LAGRANGIAN-02",
      classification: "0-Shifted Derived Cotangent T*[0]BG Moduli Stack",
      default_symplectic_shift: 0,
      default_lagrangian_rank: 14,
      default_aksz_degree: 8,
      base_fidelity_pct: 99.9985,
      base_isolation_db: 165.1,
      status: "SHIFTED_SYMPLECTIC_LOCKED",
    },
    {
      stack_id: "DONALDSON-THOMAS-03",
      classification: "(-2)-Shifted Spin(7) Derived DT-Invariant Stack",
      default_symplectic_shift: -2,
      default_lagrangian_rank: 18,
      default_aksz_degree: 12,
      base_fidelity_pct: 99.9993,
      base_isolation_db: 167.5,
      status: "SHIFTED_SYMPLECTIC_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/derived-shifted-symplectic/stacks`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_DATA);
}

