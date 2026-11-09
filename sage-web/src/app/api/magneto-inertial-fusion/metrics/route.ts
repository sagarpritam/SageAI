import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    operational_reactors: 3,
    completed_fusion_pulses: 18,
    mean_energy_gain_q: 12.5,
    confinement_scheme: "CYLINDRICAL_METALLIC_LINER_MAGNETO_INERTIAL",
    specific_impulse_threshold_s: 120000.0,
    dew_coupling_status: "HIGH_VOLTAGE_SUPERCONDUCTING_BUS_SYNCHRONIZED",
    status: "OPERATIONAL",
    timestamp: new Date().toISOString(),
  });
}
