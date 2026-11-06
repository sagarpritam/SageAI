import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const arrayId = body.array_id || "LASER-ARRAY-ATACAMA-01";
    const targetType = body.target_type || "RELATIVISTIC_LIGHTSAIL";
    const targetId = body.target_id || "STARSHOT-PROBE-01";
    const powerGw = body.beam_power_gw || 80.0;
    const duration = body.duration_seconds || 120.0;

    const isLightsail = targetType.includes("LIGHTSAIL");
    const fractionC = isLightsail ? 0.185 : 0.0;
    const missDistKm = isLightsail ? 0.0 : 42500.0;

    return NextResponse.json({
      event_id: `LASER-PULSE-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      array_id: arrayId,
      target_type: targetType,
      target_id: targetId,
      beam_power_gw: powerGw,
      duration_seconds: duration,
      radiation_pressure_pa: 33.34,
      total_photonic_thrust_newtons: 533.4,
      achieved_delta_v_m_s: 55500000.0,
      terminal_velocity_fraction_c: fractionC,
      projected_miss_distance_km: missDistKm,
      strehl_ratio: 0.92,
      status: "PULSE_DISCHARGE_SUCCESS",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

