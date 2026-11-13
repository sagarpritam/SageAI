import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  sheaves: [
    {
      sheaf_id: "DT-CY3-QUINTIC-01",
      classification: "Quintic 3-Fold Moduli of Stable Sheaves & Joyce-Song Wall-Crossing",
      default_sheaf_rank: 3,
      default_chern_degree: 6,
      default_stability_chamber_depth: 8,
      base_unitarity_pct: 99.9986,
      base_suppression_db: 166.2,
      status: "SHEAF_MODULI_LOCKED",
    },
    {
      sheaf_id: "DT-CONIFOLD-RESOLVED-02",
      classification: "Resolved Conifold Flop Invariant & Motivic Hall Algebra Complex",
      default_sheaf_rank: 4,
      default_chern_degree: 10,
      default_stability_chamber_depth: 12,
      base_unitarity_pct: 99.9994,
      base_suppression_db: 168.0,
      status: "SHEAF_MODULI_LOCKED",
    },
    {
      sheaf_id: "DT-ELLIPTIC-FIBRATION-03",
      classification: "Elliptic Fibration CY3 BPS State Sheaf & Bridgeland Chamber Lattice",
      default_sheaf_rank: 6,
      default_chern_degree: 14,
      default_stability_chamber_depth: 16,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 170.2,
      status: "SHEAF_MODULI_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/donaldson-thomas-sheaf/sheaves`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_DATA);
}
