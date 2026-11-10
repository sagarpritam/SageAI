import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  cycles: [
    {
      cycle_id: "KTHEORY-ABS-SPIN7-01",
      sector: "Type IIB Twisted K_H(X) D9-Anti-D9 Stack (Geneva Core)",
      chern_rank: 16,
      torsion_order_zn: 4,
      freed_witten_residual: 1.1e-16,
      classification_fidelity_pct: 99.995,
      status: "FREED_WITTEN_CANCELED",
    },
    {
      cycle_id: "KTHEORY-FREED-WITTEN-02",
      sector: "Type IIA Orientifold KO_8 Torsional Cycle (Cis-Lunar)",
      chern_rank: 12,
      torsion_order_zn: 2,
      freed_witten_residual: 1.8e-16,
      classification_fidelity_pct: 99.991,
      status: "FREED_WITTEN_CANCELED",
    },
    {
      cycle_id: "KTHEORY-BOTT-PERIODIC-03",
      sector: "Minasian-Moore A-Hat Roof Ramond Cycle (Lagrange L1)",
      chern_rank: 24,
      torsion_order_zn: 8,
      freed_witten_residual: 7.5e-17,
      classification_fidelity_pct: 99.997,
      status: "FREED_WITTEN_CANCELED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/ktheory-dbrane/cycles`,
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

