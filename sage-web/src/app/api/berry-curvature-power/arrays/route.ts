import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "BERRY-MOIRE-BLG-01",
      location: "Sub-Crustal Moire Bilayer Graphene Berry Dipole Collector",
      default_pump_thz: 1.8,
      berry_dipole_nm: 4.2,
      base_output_gw: 290.0,
      base_efficiency_pct: 98.18,
      status: "BERRY_DIPOLE_COHERENT",
    },
    {
      array_id: "WEYL-TAAS-DIPOLE-02",
      location: "Cryo-LEO Weyl TaAs Nonlinear Quantum Hall Rectifier Ring",
      default_pump_thz: 3.2,
      berry_dipole_nm: 6.8,
      base_output_gw: 420.0,
      base_efficiency_pct: 98.66,
      status: "BERRY_DIPOLE_COHERENT",
    },
    {
      array_id: "KAGOME-CHERN-HARVEST-03",
      location: "Lagrange-L1 Kagome Chern-Magnet Anomalous Nernst Array",
      default_pump_thz: 5.4,
      berry_dipole_nm: 9.4,
      base_output_gw: 585.0,
      base_efficiency_pct: 99.12,
      status: "BERRY_DIPOLE_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/berry-curvature-power/arrays`,
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

