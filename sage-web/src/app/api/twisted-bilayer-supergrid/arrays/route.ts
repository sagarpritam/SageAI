import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "MATTG-ANDREEV-ARRAY-01",
      location: "Oceanic Magic-Angle Twisted-Trilayer Andreev Rectifier Ring",
      default_twist_millideg: 1560,
      chern_flat_band: 2,
      base_output_gw: 306.0,
      base_efficiency_pct: 98.31,
      status: "ANDREEV_COHERENT",
    },
    {
      array_id: "FLATBAND-SUPER-HVDC-02",
      location: "Equatorial Quantum-Metric Superconducting HVDC Trunk",
      default_twist_millideg: 1580,
      chern_flat_band: 4,
      base_output_gw: 446.0,
      base_efficiency_pct: 98.81,
      status: "ANDREEV_COHERENT",
    },
    {
      array_id: "ORBITAL-CRYO-SUPERGRID-03",
      location: "Orbital Cryo-Passive Magic-Angle Andreev Baseload Matrix",
      default_twist_millideg: 1595,
      chern_flat_band: 6,
      base_output_gw: 622.0,
      base_efficiency_pct: 99.24,
      status: "ANDREEV_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/twisted-bilayer-supergrid/arrays`,
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

