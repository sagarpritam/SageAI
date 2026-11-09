import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      satellite_id: "HPM-SAT-LEO-ALPHA-01",
      satellite_name: "Mjolnir-1 Tactical Microwave Satellite",
      orbit_type: "LEO_TACTICAL_ORBIT",
      altitude_km: 450.0,
      microwave_source_type: "RELATIVISTIC_MAGNETRON",
      center_frequency_ghz: 1.3,
      peak_pulse_power_gw: 2.4,
      pulse_rise_time_ns: 0.68,
      antenna_aperture_diameter_m: 12.5,
      field_intensity_at_target_kv_m: 42.0,
      status: "HPM_GRID_READY",
    },
    {
      satellite_id: "HPM-SAT-LEO-BRAVO-02",
      satellite_name: "Mjolnir-2 Counter-Air Defense Node",
      orbit_type: "LEO_TACTICAL_ORBIT",
      altitude_km: 480.0,
      microwave_source_type: "VIRTUAL_CATHODE_OSCILLATOR_VIRCATOR",
      center_frequency_ghz: 2.8,
      peak_pulse_power_gw: 1.9,
      pulse_rise_time_ns: 0.82,
      antenna_aperture_diameter_m: 10.5,
      field_intensity_at_target_kv_m: 36.5,
      status: "HPM_GRID_READY",
    },
    {
      satellite_id: "HPM-SAT-MEO-GAMMA-03",
      satellite_name: "Mjolnir-3 Wide-Area Strategic Node",
      orbit_type: "MEO_STRATEGIC_ORBIT",
      altitude_km: 2000.0,
      microwave_source_type: "RELATIVISTIC_KLYSTRON_AMPLIFIER",
      center_frequency_ghz: 3.5,
      peak_pulse_power_gw: 4.8,
      pulse_rise_time_ns: 0.55,
      antenna_aperture_diameter_m: 24.0,
      field_intensity_at_target_kv_m: 58.0,
      status: "HPM_GRID_READY",
    },
  ]);
}

