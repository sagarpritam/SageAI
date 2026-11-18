import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "POLARITON-BEC-ARRAY-01",
      classification: "Perovskite Microcavity Exciton-Polariton Macroscopic BEC Baseload Harvester",
      condensate_density_cm2: 4.8e14,
      rabi_splitting_mev: 110.0,
      base_output_gw: 524.4,
      base_efficiency_pct: 98.88,
      status: "POLARITON_SUPERGRID_OPTIMAL",
    },
    {
      array_id: "POLARITON-CONDENSATE-HVDC-02",
      classification: "Superconducting Transition-Metal Dichalcogenide (TMD) Polariton Superfluid HVDC Node",
      condensate_density_cm2: 7.2e14,
      rabi_splitting_mev: 145.0,
      base_output_gw: 796.8,
      base_efficiency_pct: 99.35,
      status: "POLARITON_SUPERGRID_OPTIMAL",
    },
    {
      array_id: "POLARITON-ORBITAL-RING-03",
      classification: "Planetary Polariton Soliton Vortex Persistent-Current Clean Baseload Ring",
      condensate_density_cm2: 9.6e14,
      rabi_splitting_mev: 180.0,
      base_output_gw: 1215.0,
      base_efficiency_pct: 99.78,
      status: "POLARITON_SUPERGRID_OPTIMAL",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/polariton-bec-supergrid/arrays`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_DATA);
}

