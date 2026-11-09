import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reactorId = body.reactor_id || "MIF-REACTOR-ORBITAL-01";
    const boost = body.current_boost_ma || 2.0;
    const compression = body.compression_gain || 1.0;

    const current = 20.5 + boost;
    const qVal = Number((11.4 * (1.0 + 0.05 * compression)).toFixed(2));
    const thermalGw = Number((2.85 * (1.0 + 0.06 * compression)).toFixed(2));
    const electricalMw = Number((thermalGw * 340.0).toFixed(1));
    const exhaustVel = Number((1180.0 + current * 4.5).toFixed(1));
    const isp = Number((exhaustVel * 101.97).toFixed(1));

    return NextResponse.json({
      pulse_id: `MIF-PULSE-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      reactor_id: reactorId,
      peak_current_ma: current,
      fusion_gain_q: qVal,
      plasma_implosion_pressure_mbar: Number((48.5 * Math.pow(current / 20.0, 2)).toFixed(1)),
      thermal_yield_gw: thermalGw,
      direct_electrical_conversion_mw: electricalMw,
      magnetic_nozzle_exhaust_velocity_kms: exhaustVel,
      specific_impulse_isp_s: isp,
      dew_array_power_bus_charged: true,
      status: "MIF_THERMONUCLEAR_PULSE_SUCCESS",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

