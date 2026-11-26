import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/planetary-polar-cusp/funnels`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Planetary Polar Cusp funnels:", err);
    return NextResponse.json({
      funnels: [
        {
          funnel_id: "POLAR-CUSP-NORTH-01",
          magnetic_latitude: "76.5°–81.0° N",
          solar_wind_speed_kms: 540.0,
          cusp_flux_mw: 11120.0,
          nominal_baseload_gw: 3.94,
          funnel_efficiency_pct: 99.4,
          funnel_state: "POLAR_CUSP_FUNNEL_LOCKED",
        },
        {
          funnel_id: "POLAR-CUSP-SOUTH-02",
          magnetic_latitude: "76.0°–80.5° S",
          solar_wind_speed_kms: 535.0,
          cusp_flux_mw: 10980.0,
          nominal_baseload_gw: 3.72,
          funnel_efficiency_pct: 99.3,
          funnel_state: "POLAR_CUSP_FUNNEL_LOCKED",
        },
        {
          funnel_id: "POLAR-CUSP-MAGNETOSHEATH-03",
          magnetic_latitude: "81.0°–85.0° Polar",
          solar_wind_speed_kms: 580.0,
          cusp_flux_mw: 10460.0,
          nominal_baseload_gw: 3.46,
          funnel_efficiency_pct: 99.2,
          funnel_state: "POLAR_CUSP_FUNNEL_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
