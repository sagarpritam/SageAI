import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "AXION-ADMX-TOROID-01",
      location: "Cryo-Superconducting Sub-Crustal 14 T NbTi Primakov Toroid",
      default_magnetic_field_t: 14.0,
      default_cavity_q_million: 2.4,
      nominal_output_gw: 188.0,
      base_rectification_eff_pct: 95.4,
      status: "HALOSCOPE_ARRAY_TUNED",
    },
    {
      array_id: "AXION-TOPO-INSULATOR-02",
      location: "MnBi2Te4 / Bi2Se3 Topological Axion-Polariton Resonance Vault",
      default_magnetic_field_t: 16.5,
      default_cavity_q_million: 3.1,
      nominal_output_gw: 216.0,
      base_rectification_eff_pct: 96.1,
      status: "HALOSCOPE_ARRAY_TUNED",
    },
    {
      array_id: "AXION-ORBITAL-SUPERRAD-03",
      location: "Lagrange L2 Coherent Relic-Axion Dielectric Disk Haloscope",
      default_magnetic_field_t: 18.0,
      default_cavity_q_million: 3.8,
      nominal_output_gw: 248.0,
      base_rectification_eff_pct: 96.5,
      status: "HALOSCOPE_ARRAY_TUNED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/axion-haloscope-power/arrays`,
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

