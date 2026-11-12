import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  cavities: [
    {
      cavity_id: "FLOQUET-BLOCH-ORBIT-01",
      location: "Equatorial GEO Floquet-Bloch Topological Photonic Collector Ring",
      chern_invariant: 2,
      default_drive_thz: 18.5,
      default_q_factor_1e8: 4.8,
      base_efficiency_pct: 97.82,
      status: "FLOQUET_BLOCH_LOCKED",
    },
    {
      cavity_id: "KERR-CAVITY-CRUST-02",
      location: "Sub-Lithospheric High-Q Kerr Soliton Rectification Matrix",
      chern_invariant: 4,
      default_drive_thz: 24.0,
      default_q_factor_1e8: 6.2,
      base_efficiency_pct: 98.36,
      status: "FLOQUET_BLOCH_LOCKED",
    },
    {
      cavity_id: "TOPO-PHOTONIC-L2-03",
      location: "Lagrange-L2 Haldane-Edge Topological Photonic Harvester",
      chern_invariant: 6,
      default_drive_thz: 31.5,
      default_q_factor_1e8: 8.4,
      base_efficiency_pct: 98.84,
      status: "FLOQUET_BLOCH_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/bloch-schwinger-power/cavities`,
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

