import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      reactor_id: "MIF-REACTOR-ORBITAL-01",
      callsign: "Prometheus Sovereign High-Orbit MIF Core",
      peak_driver_current_ma: 20.5,
      plasma_liner_velocity_kms: 125.0,
      thermonuclear_q_factor: 11.4,
      pulse_repetition_rate_hz: 10.0,
      thermal_power_output_gw: 2.85,
      magnetic_nozzle_isp_seconds: 128500.0,
      status: "MIF_MAGNETIC_LINER_ARMED",
    },
    {
      reactor_id: "MIF-REACTOR-LUNAR-02",
      callsign: "Artemis Deep-Well South-Pole Toroidal Liner Array",
      peak_driver_current_ma: 22.8,
      plasma_liner_velocity_kms: 135.0,
      thermonuclear_q_factor: 12.8,
      pulse_repetition_rate_hz: 10.0,
      thermal_power_output_gw: 3.40,
      magnetic_nozzle_isp_seconds: 134000.0,
      status: "MIF_MAGNETIC_LINER_ARMED",
    },
    {
      reactor_id: "MIF-REACTOR-DEEP-SPACE-03",
      callsign: "Helios Interplanetary Pulse Wave Propulsion Vault",
      peak_driver_current_ma: 24.5,
      plasma_liner_velocity_kms: 145.0,
      thermonuclear_q_factor: 13.6,
      pulse_repetition_rate_hz: 10.0,
      thermal_power_output_gw: 3.85,
      magnetic_nozzle_isp_seconds: 142000.0,
      status: "MIF_MAGNETIC_LINER_ARMED",
    },
  ]);
}
