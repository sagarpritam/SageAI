import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      array_id: "LASER-ARRAY-ATACAMA-01",
      location_name: "Atacama High Plateau Array",
      latitude: -24.6272,
      longitude: -70.4042,
      altitude_m: 5050.0,
      total_power_gw: 100.0,
      operating_wavelength_nm: 1064.0,
      synthesized_aperture_m: 1200.0,
      sub_emitter_tiles: 12500,
      strehl_ratio: 0.92,
      tracking_slew_rate_deg_s: 12.5,
      status: "PHASE_LOCKED_ACTIVE",
    },
    {
      array_id: "LASER-ARRAY-MAUNA-KEA-02",
      location_name: "Mauna Kea High-Altitude Array",
      latitude: 19.8206,
      longitude: -155.4681,
      altitude_m: 4205.0,
      total_power_gw: 85.0,
      operating_wavelength_nm: 1064.0,
      synthesized_aperture_m: 950.0,
      sub_emitter_tiles: 9800,
      strehl_ratio: 0.89,
      tracking_slew_rate_deg_s: 12.5,
      status: "PHASE_LOCKED_ACTIVE",
    },
    {
      array_id: "LASER-ARRAY-ORBITAL-HELIOS-03",
      location_name: "Orbital Lagrange L1 Phased Platform",
      latitude: 0.0,
      longitude: 0.0,
      altitude_m: 326400000.0,
      total_power_gw: 120.0,
      operating_wavelength_nm: 1064.0,
      synthesized_aperture_m: 1500.0,
      sub_emitter_tiles: 15000,
      strehl_ratio: 0.98,
      tracking_slew_rate_deg_s: 12.5,
      status: "PHASE_LOCKED_ACTIVE",
    },
  ]);
}

