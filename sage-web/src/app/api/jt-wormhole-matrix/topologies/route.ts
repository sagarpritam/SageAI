import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  topologies: [
    {
      topology_id: "JT-SSS-TRUMPET-01",
      geometry: "SSS Double-Scaled Matrix Trumpet Wormhole (e^{S_0} = 4096)",
      default_genus_g: 2,
      default_s0_entropy: 8.4,
      default_schwarzian_temp: 1.25,
      base_fidelity_pct: 99.997,
      base_suppression_db: 157.6,
      status: "JT_WORMHOLE_LOCKED",
    },
    {
      topology_id: "JT-MIRZAKHANI-WP-02",
      geometry: "Mirzakhani Weil-Petersson Moduli Handlebody (V_{g,n} Stable)",
      default_genus_g: 4,
      default_s0_entropy: 10.2,
      default_schwarzian_temp: 1.5,
      base_fidelity_pct: 99.998,
      base_suppression_db: 160.2,
      status: "JT_WORMHOLE_LOCKED",
    },
    {
      topology_id: "JT-EOW-BRANE-03",
      geometry: "End-of-the-World Brane Non-Perturbative Matrix Saddle (SSS-EoW)",
      default_genus_g: 6,
      default_s0_entropy: 12.0,
      default_schwarzian_temp: 1.85,
      base_fidelity_pct: 99.999,
      base_suppression_db: 162.9,
      status: "JT_WORMHOLE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/jt-wormhole-matrix/topologies`,
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

