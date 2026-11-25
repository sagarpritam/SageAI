import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/mantle-transition-zone-wadsleyite-supergrid/arrays`,
      { method: "GET" },
      8000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, { arrays: [] }));
    }
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      arrays: [
        {
          array_id: "WADSLEYITE-PACIFIC-SLAB-01",
          location: "Mariana-Izu Subduction Slab Mantle Transition Zone Conduit",
          transition_depth_km: 520.0,
          water_content_wt_pct: 2.15,
          proton_conductivity_s_m: 0.42,
          temperature_k: 1780.0,
          base_extraction_efficiency_pct: 99.68,
          status: "WADSLEYITE_SUPERIONIC_ACTIVE",
        },
        {
          array_id: "RINGWOODITE-TONGA-KERMADEC-02",
          location: "Tonga Trench Deep Stagnant Slab Ringwoodite Layer",
          transition_depth_km: 610.0,
          water_content_wt_pct: 2.45,
          proton_conductivity_s_m: 0.58,
          temperature_k: 1850.0,
          base_extraction_efficiency_pct: 99.74,
          status: "RINGWOODITE_SUPERIONIC_ACTIVE",
        },
        {
          array_id: "WADSLEYITE-ALPINE-MEDITERRANEAN-03",
          location: "Mediterranean Relict Slab Transition Zone Array",
          transition_depth_km: 480.0,
          water_content_wt_pct: 1.85,
          proton_conductivity_s_m: 0.36,
          temperature_k: 1720.0,
          base_extraction_efficiency_pct: 99.55,
          status: "WADSLEYITE_SUPERIONIC_ACTIVE",
        },
      ],
    },
    { status: 200 }
  );
}
