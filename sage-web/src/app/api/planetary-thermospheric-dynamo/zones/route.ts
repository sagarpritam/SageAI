import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/planetary-thermospheric-dynamo/zones`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Thermospheric Dynamo zones:", err);
  }

  return NextResponse.json({
    zones: [
      {
        zone_id: "THERMOSPHERE-JOULE-RING-01",
        name: "Polar Thermospheric Joule Heating & Ion-Drag Ring",
        altitude_km: 220.0,
        ion_velocity_ms: 1450.0,
        nominal_baseload_gw: 3.55,
        dynamo_efficiency_pct: 98.8,
        status: "THERMOSPHERIC_DYNAMO_LOCKED",
      },
      {
        zone_id: "F-REGION-FOUNTAIN-DYNAMO-02",
        name: "F-Region Equatorial Fountain & E x B Drift Dynamo",
        altitude_km: 320.0,
        ion_velocity_ms: 1680.0,
        nominal_baseload_gw: 3.75,
        dynamo_efficiency_pct: 99.1,
        status: "THERMOSPHERIC_DYNAMO_LOCKED",
      },
      {
        zone_id: "POLAR-CUSP-ION-OUTFLOW-03",
        name: "Polar Cusp Oxygen-Ion Outflow Inductive Loop",
        altitude_km: 410.0,
        ion_velocity_ms: 2100.0,
        nominal_baseload_gw: 2.66,
        dynamo_efficiency_pct: 98.6,
        status: "THERMOSPHERIC_DYNAMO_LOCKED",
      },
    ],
  });
}
