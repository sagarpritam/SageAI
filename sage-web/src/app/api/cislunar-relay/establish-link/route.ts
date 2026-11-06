import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sourceId = body.source_id || "EARTH-OCP-TENERIFE";
    const targetId = body.target_id || "LAGRANGE-L1-HALO-1";
    const oamModes = body.requested_oam_modes || [-2, -1, 0, 1, 2];

    const distKm = targetId.includes("L2") ? 448900.0 : 326400.0;
    const lightDelay = +(distKm / 299792.458).toFixed(4);

    return NextResponse.json({
      transmission_id: `CISLUNAR-TX-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      source_node: sourceId,
      target_node: targetId,
      distance_km: distKm,
      one_way_light_delay_sec: lightDelay,
      shapiro_delay_nsec: 1.48,
      received_optical_power_dbm: -44.2,
      quantum_bit_error_rate_qber: 0.024,
      secure_key_rate_kbps: 48.6,
      oam_aggregate_throughput_gbps: 380.5,
      beam_drift_correction_urad: 0.312,
      link_status: "LOCK_OPTIMAL",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
