import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "MAGNON-YIG-PT-01",
      location: "Sub-Crustal YIG/Pt Spin-Seebeck Magnon-BEC Ring",
      default_magnon_ghz: 42.0,
      spin_hall_angle: 0.34,
      base_output_gw: 280.0,
      base_efficiency_pct: 98.08,
      status: "MAGNON_BEC_COHERENT",
    },
    {
      array_id: "WEYL-SPIN-CALORITRONIC-02",
      location: "Cryo-LEO Weyl-Semimetal Topological Spin-Peltier Collector",
      default_magnon_ghz: 68.0,
      spin_hall_angle: 0.46,
      base_output_gw: 405.0,
      base_efficiency_pct: 98.58,
      status: "MAGNON_BEC_COHERENT",
    },
    {
      array_id: "POLARITON-MAGNON-03",
      location: "Lagrange-L1 Cavity Magnon-Polariton Rectifier Array",
      default_magnon_ghz: 96.0,
      spin_hall_angle: 0.58,
      base_output_gw: 565.0,
      base_efficiency_pct: 99.04,
      status: "MAGNON_BEC_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/spin-caloritronic-power/arrays`,
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

