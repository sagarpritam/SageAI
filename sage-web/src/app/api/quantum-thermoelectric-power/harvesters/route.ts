import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  harvesters: [
    {
      harvester_id: "NONHERM-SKIN-ARRAY-01",
      location: "Sub-Marine Hatano-Nelson Non-Hermitian Skin-Effect Rectifier Ring",
      default_bath_delta_k: 420.0,
      winding_invariant: 4,
      base_output_gw: 298.0,
      base_efficiency_pct: 98.24,
      status: "SKIN_EFFECT_COHERENT",
    },
    {
      harvester_id: "PT-SYMMETRIC-CAVITY-02",
      location: "Equatorial PT-Symmetric Whispering-Gallery Harvester",
      default_bath_delta_k: 580.0,
      winding_invariant: 6,
      base_output_gw: 434.0,
      base_efficiency_pct: 98.74,
      status: "SKIN_EFFECT_COHERENT",
    },
    {
      harvester_id: "QUANTUM-RATCHET-L2-03",
      location: "Sun-Earth L2 Chiral Quantum Brownian Josephson Ratchet Matrix",
      default_bath_delta_k: 760.0,
      winding_invariant: 8,
      base_output_gw: 605.0,
      base_efficiency_pct: 99.18,
      status: "SKIN_EFFECT_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/quantum-thermoelectric-power/harvesters`,
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

