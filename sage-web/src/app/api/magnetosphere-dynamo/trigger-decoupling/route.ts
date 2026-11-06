import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stationId = body.station_id || "DYNAMO-ORBITAL-COIL-01";
    const threatType = body.threat_type || "HEMP_NUCLEAR_BURST";
    const e1Field = body.simulated_e1_kv_m || 55.0;
    const riseTime = body.simulated_rise_time_ns || 2.1;

    return NextResponse.json({
      decoupling_id: `EMP-DECOUP-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      station_id: stationId,
      threat_type: threatType,
      peak_electric_field_kv_m: e1Field,
      rise_time_ns: riseTime,
      clamped_e1_voltage_volts: +(e1Field * 1000 * 0.00045).toFixed(2),
      attenuation_ratio_db: 49.5,
      substation_gic_reduced_pct: 99.8,
      alfven_wave_injected_amplitude_t: 0.000245,
      mitigation_latency_ns: 0.35,
      verdict: "HEMP_SURGE_DECOUPLED_AND_QUENCHED",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

