import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  horizons: [
    {
      horizon_id: "QES-PAGE-JT-ADS2-01",
      geometry: "2D Jackiw-Teitelboim AdS_2 Black Hole + CFT_2 Bath",
      default_bh_entropy_s0: 180.0,
      default_page_ratio: 1.35,
      base_unitarity_fidelity_pct: 99.997,
      base_firewall_quench_db: 151.4,
      status: "QES_ISLAND_DOMINANT",
    },
    {
      horizon_id: "QES-REPLICA-WORMHOLE-02",
      geometry: "Planar AdS_5 Replica-Wormhole Saddle Enclave Boundary",
      default_bh_entropy_s0: 240.0,
      default_page_ratio: 1.6,
      base_unitarity_fidelity_pct: 99.995,
      base_firewall_quench_db: 149.8,
      status: "QES_ISLAND_DOMINANT",
    },
    {
      horizon_id: "QES-BCFT-BRANE-03",
      geometry: "Karch-Randall End-of-the-World Brane AdS/BCFT Horizon",
      default_bh_entropy_s0: 310.0,
      default_page_ratio: 1.85,
      base_unitarity_fidelity_pct: 99.998,
      base_firewall_quench_db: 153.1,
      status: "QES_ISLAND_DOMINANT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/quantum-extremal-island/horizons`,
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

