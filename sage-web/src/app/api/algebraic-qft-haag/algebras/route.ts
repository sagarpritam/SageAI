import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  algebras: [
    {
      algebra_id: "AQFT-HAAG-DIAMOND-01",
      net_sector: "Haag-Kastler Double-Cone Net A(O) Type III_1 Factor",
      default_diamond_radius: 2.4,
      default_split_distance: 0.45,
      default_modular_temp: 1.0,
      base_unitarity_pct: 99.997,
      base_isolation_db: 159.6,
      status: "AQFT_NET_ACTIVE",
    },
    {
      algebra_id: "TOMITA-WEDGE-BISOGNANO-02",
      net_sector: "Bisognano-Wichmann Rindler Wedge Tomita-Takesaki Modular Flow",
      default_diamond_radius: 3.8,
      default_split_distance: 0.65,
      default_modular_temp: 1.35,
      base_unitarity_pct: 99.998,
      base_isolation_db: 162.1,
      status: "AQFT_NET_ACTIVE",
    },
    {
      algebra_id: "BUCHHOLZ-SPLIT-NUCLEAR-03",
      net_sector: "Buchholz-Wichmann Split-Property Nuclearity Functor Envelope",
      default_diamond_radius: 5.2,
      default_split_distance: 0.85,
      default_modular_temp: 1.7,
      base_unitarity_pct: 99.999,
      base_isolation_db: 164.8,
      status: "AQFT_NET_ACTIVE",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/algebraic-qft-haag/algebras`,
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

