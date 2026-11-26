import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/planetary-stratospheric-jetstream/streams`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Stratospheric Jetstream streams:", err);
  }

  return NextResponse.json({
    streams: [
      {
        stream_id: "POLAR-FRONT-JETSTREAM-01",
        name: "Polar Front Stratospheric Jet-Stream Triboelectric Array",
        altitude_km: 11.2,
        wind_velocity_ms: 92.4,
        nominal_baseload_gw: 3.45,
        triboelectric_efficiency_pct: 98.6,
        status: "JETSTREAM_TRIBOELECTRIC_LOCKED",
      },
      {
        stream_id: "SUBTROPICAL-ROSSBY-WAVEGUIDE-02",
        name: "Subtropical Rossby Waveguide Tropopause Shear Ring",
        altitude_km: 14.8,
        wind_velocity_ms: 84.0,
        nominal_baseload_gw: 3.65,
        triboelectric_efficiency_pct: 98.9,
        status: "JETSTREAM_TRIBOELECTRIC_LOCKED",
      },
      {
        stream_id: "EQUATORIAL-QBO-TROPOPAUSE-03",
        name: "Equatorial QBO Stratospheric Shear Induction Loop",
        altitude_km: 18.5,
        wind_velocity_ms: 71.5,
        nominal_baseload_gw: 2.62,
        triboelectric_efficiency_pct: 98.3,
        status: "JETSTREAM_TRIBOELECTRIC_LOCKED",
      },
    ],
  });
}
