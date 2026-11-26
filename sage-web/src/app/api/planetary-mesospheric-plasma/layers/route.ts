import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/planetary-mesospheric-plasma/layers`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Mesospheric Plasma layers:", err);
  }

  return NextResponse.json({
    layers: [
      {
        layer_id: "MESOPAUSE-NOCTILUCENT-01",
        name: "Polar Mesopause Noctilucent Dusty Plasma Array",
        altitude_km: 82.5,
        plasma_density_cm3: 1.2e5,
        nominal_baseload_gw: 3.5,
        plasma_efficiency_pct: 98.7,
        status: "MESOSPHERIC_PLASMA_LOCKED",
      },
      {
        layer_id: "EQUATORIAL-ELECTROJET-E-02",
        name: "Equatorial E-Region Electrojet Hall-Pedersen Ring",
        altitude_km: 105.0,
        plasma_density_cm3: 2.4e5,
        nominal_baseload_gw: 3.7,
        plasma_efficiency_pct: 99.0,
        status: "MESOSPHERIC_PLASMA_LOCKED",
      },
      {
        layer_id: "SPORADIC-E-PLASMA-SHEET-03",
        name: "Mid-Latitude Sporadic-E Metallic Ion Induction Sheet",
        altitude_km: 96.0,
        plasma_density_cm3: 1.8e5,
        nominal_baseload_gw: 2.64,
        plasma_efficiency_pct: 98.5,
        status: "MESOSPHERIC_PLASMA_LOCKED",
      },
    ],
  });
}
