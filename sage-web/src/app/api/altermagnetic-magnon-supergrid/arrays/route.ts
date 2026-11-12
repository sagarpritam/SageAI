import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "ALTERMAG-RUO2-ARRAY-01",
      location: "Equatorial d-Wave Altermagnetic RuO2 Spin-Split Array",
      default_spin_split_mev: 480.0,
      dwave_harmonic_order: 4,
      base_output_gw: 334.0,
      base_efficiency_pct: 98.48,
      status: "ALTERMAG_COHERENT",
    },
    {
      array_id: "CHIRAL-MNTE-HVDC-02",
      location: "Trans-Continental Chiral MnTe Zero-Stray-Flux Magnon Trunk",
      default_spin_split_mev: 590.0,
      dwave_harmonic_order: 6,
      base_output_gw: 486.0,
      base_efficiency_pct: 98.94,
      status: "ALTERMAG_COHERENT",
    },
    {
      array_id: "MAGNON-ORBITAL-RING-03",
      location: "Orbital THz Altermagnetic Spin-Torque Rectification Ring",
      default_spin_split_mev: 720.0,
      dwave_harmonic_order: 8,
      base_output_gw: 678.0,
      base_efficiency_pct: 99.36,
      status: "ALTERMAG_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/altermagnetic-magnon-supergrid/arrays`,
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

