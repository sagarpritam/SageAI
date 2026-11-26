import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/planetary-exospheric-geocorona/shells`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Exospheric Geocorona shells:", err);
  }

  return NextResponse.json({
    shells: [
      {
        shell_id: "EXOSPHERE-GEOCORONA-LYMAN-01",
        name: "Exospheric Hydrogen Geocorona Charge-Exchange Array",
        altitude_km: 6500.0,
        solar_wind_kms: 480.0,
        nominal_baseload_gw: 3.6,
        reconnection_efficiency_pct: 98.9,
        status: "EXOSPHERIC_GEOCORONA_LOCKED",
      },
      {
        shell_id: "MAGNETOPAUSE-RECONNECTION-02",
        name: "Dayside Magnetopause Reconnection Flux-Transfer Ring",
        altitude_km: 63710.0,
        solar_wind_kms: 540.0,
        nominal_baseload_gw: 3.8,
        reconnection_efficiency_pct: 99.2,
        status: "EXOSPHERIC_GEOCORONA_LOCKED",
      },
      {
        shell_id: "MAGNETOTAIL-PLASMASHEET-03",
        name: "Magnetotail Plasmasheet Cross-Tail Inductive Loop",
        altitude_km: 95000.0,
        solar_wind_kms: 610.0,
        nominal_baseload_gw: 2.68,
        reconnection_efficiency_pct: 98.7,
        status: "EXOSPHERIC_GEOCORONA_LOCKED",
      },
    ],
  });
}
