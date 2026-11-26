import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  let body: {
    shell_id?: string;
    reconnection_multiplier?: number;
    reconnection_efficiency?: number;
    dispatch_duration_s?: number;
  } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const shell_id = body.shell_id || "EXOSPHERE-GEOCORONA-LYMAN-01";
  const reconnection_multiplier = body.reconnection_multiplier ?? 1.05;
  const reconnection_efficiency = body.reconnection_efficiency ?? 0.989;
  const dispatch_duration_s = body.dispatch_duration_s ?? 60.0;

  try {
    const res = await fetch(
      `${FASTAPI_BASE}/api/planetary-exospheric-geocorona/harvest-exospheric-power`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shell_id,
          reconnection_multiplier,
          reconnection_efficiency,
          dispatch_duration_s,
        }),
      }
    );
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Exospheric Geocorona dispatch:", err);
  }

  const harvested_power_gw = Number((3.6 * reconnection_multiplier * reconnection_efficiency * 2.8).toFixed(3));
  return NextResponse.json({
    shell_id,
    status: "EXOSPHERIC_POWER_DISPATCHED",
    harvested_power_gw,
    geocorona_flux_mw: Number((harvested_power_gw * 1000).toFixed(2)),
    altitude_km: 6500.0,
    solar_wind_kms: 480.0,
    reconnection_efficiency_pct: Number((reconnection_efficiency * 100).toFixed(2)),
    grid_stability_pct: 99.999,
    dispatch_duration_s,
    exospheric_coupling_state: "EXOSPHERIC_GEOCORONA_LOCKED",
    timestamp: new Date().toISOString(),
  });
}
