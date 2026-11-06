import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      station_id: "DYNAMO-ORBITAL-COIL-01",
      station_type: "ORBITAL_HTS_COIL",
      latitude: 0.0,
      longitude: -95.0,
      altitude_km: 35786.0,
      magnetic_moment_am2: 4.5e12,
      hts_field_tesla: 15.0,
      alfven_resonance_freq_hz: 1.2,
      hemp_e1_clamping_speed_ps: 350.0,
      status: "FIELD_LOCKED_MONITORING",
    },
    {
      station_id: "DYNAMO-GROUND-MHD-CHEYENNE",
      station_type: "GROUND_MHD_STATION",
      latitude: 38.7439,
      longitude: -104.8475,
      altitude_km: 2.1,
      magnetic_moment_am2: 4.5e12,
      hts_field_tesla: 12.5,
      alfven_resonance_freq_hz: 1.8,
      hemp_e1_clamping_speed_ps: 390.0,
      status: "FIELD_LOCKED_MONITORING",
    },
    {
      station_id: "DYNAMO-GROUND-MHD-TROMSO",
      station_type: "GROUND_MHD_STATION",
      latitude: 69.6492,
      longitude: 18.9553,
      altitude_km: 0.15,
      magnetic_moment_am2: 4.5e12,
      hts_field_tesla: 14.0,
      alfven_resonance_freq_hz: 0.85,
      hemp_e1_clamping_speed_ps: 370.0,
      status: "FIELD_LOCKED_MONITORING",
    },
  ]);
}

