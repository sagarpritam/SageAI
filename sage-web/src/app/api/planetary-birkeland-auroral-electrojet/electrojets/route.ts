import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/planetary-birkeland-auroral-electrojet/electrojets`, { method: "GET" }, 8000);
    if (res.ok) return NextResponse.json(await safeUpstreamJson(res, { electrojets: [] }));
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      electrojets: [
        {
          electrojet_id: "BIRKELAND-REGION1-AURORAL-OVAL-01",
          name: "Region-1 Field-Aligned Birkeland Sheet & Auroral Electrojet 01",
          altitude_km: 115.0,
          field_aligned_current_ma: 5.4,
          hall_pedersen_ratio: 2.2,
          nominal_capacity_gw: 8.400,
          ionospheric_flux_mw: 732.0,
          birkeland_coupling_state: "BIRKELAND_ELECTROJET_LOCKED",
          tether_efficiency_pct: 97.5,
        },
        {
          electrojet_id: "BIRKELAND-REGION2-RING-CURRENT-02",
          name: "Region-2 Inner Magnetosphere Ring-Current Closure 02",
          altitude_km: 125.0,
          field_aligned_current_ma: 3.8,
          hall_pedersen_ratio: 1.9,
          nominal_capacity_gw: 6.200,
          ionospheric_flux_mw: 540.0,
          birkeland_coupling_state: "BIRKELAND_ELECTROJET_LOCKED",
          tether_efficiency_pct: 97.0,
        },
        {
          electrojet_id: "BIRKELAND-SUBSTORMS-WEDGE-03",
          name: "Substorm Current Wedge Tail-to-Ionosphere Harvester 03",
          altitude_km: 108.0,
          field_aligned_current_ma: 7.2,
          hall_pedersen_ratio: 2.5,
          nominal_capacity_gw: 7.800,
          ionospheric_flux_mw: 680.0,
          birkeland_coupling_state: "BIRKELAND_ELECTROJET_LOCKED",
          tether_efficiency_pct: 98.0,
        },
      ],
    },
    { status: 200 }
  );
}
