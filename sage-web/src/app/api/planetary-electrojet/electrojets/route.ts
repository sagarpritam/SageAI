import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/planetary-electrojet/electrojets`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Planetary Electrojets:", err);
    return NextResponse.json({
      electrojets: [
        {
          electrojet_id: "ELECTROJET-WESTWARD-01",
          ionospheric_band: "64.0°–71.0° N (110 km)",
          hall_current_ma: 1.85,
          electrojet_flux_mw: 11680.0,
          nominal_baseload_gw: 4.14,
          induction_efficiency_pct: 99.6,
          electrojet_state: "ELECTROJET_SUBSTORM_LOCKED",
        },
        {
          electrojet_id: "ELECTROJET-EASTWARD-02",
          ionospheric_band: "63.5°–70.5° S (115 km)",
          hall_current_ma: 1.68,
          electrojet_flux_mw: 11420.0,
          nominal_baseload_gw: 3.92,
          induction_efficiency_pct: 99.5,
          electrojet_state: "ELECTROJET_SUBSTORM_LOCKED",
        },
        {
          electrojet_id: "ELECTROJET-HARANG-03",
          ionospheric_band: "Harang Discontinuity",
          hall_current_ma: 1.52,
          electrojet_flux_mw: 10940.0,
          nominal_baseload_gw: 3.62,
          induction_efficiency_pct: 99.4,
          electrojet_state: "ELECTROJET_SUBSTORM_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
