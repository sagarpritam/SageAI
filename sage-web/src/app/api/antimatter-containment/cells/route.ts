import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      cell_id: "CELL-ALPHA-PENNING-01",
      facility_name: "Underground Cryo-Vault Geneva",
      magnetic_field_tesla: 11.2,
      cryogenic_temp_kelvin: 3.6,
      vacuum_pressure_mbar: 3.8e-15,
      axial_well_voltage_volts: 350.0,
      antiproton_count: 850000000,
      plasma_radius_mm: 1.65,
      diocotron_mode_frequency_khz: 44.1,
      rotating_wall_amplitude_v: 2.4,
      confinement_time_margin_hours: 720.0,
      containment_status: "CRYOGENIC_STABLE_CONFINED",
    },
    {
      cell_id: "CELL-BETA-PENNING-02",
      facility_name: "Subterranean Redoubt Cheyenne",
      magnetic_field_tesla: 10.8,
      cryogenic_temp_kelvin: 3.9,
      vacuum_pressure_mbar: 4.5e-15,
      axial_well_voltage_volts: 350.0,
      antiproton_count: 620000000,
      plasma_radius_mm: 1.92,
      diocotron_mode_frequency_khz: 41.5,
      rotating_wall_amplitude_v: 2.4,
      confinement_time_margin_hours: 720.0,
      containment_status: "CRYOGENIC_STABLE_CONFINED",
    },
    {
      cell_id: "CELL-GAMMA-ORBITAL-03",
      facility_name: "Orbital Platform Aegis-3",
      magnetic_field_tesla: 12.0,
      cryogenic_temp_kelvin: 2.7,
      vacuum_pressure_mbar: 1.2e-15,
      axial_well_voltage_volts: 350.0,
      antiproton_count: 1200000000,
      plasma_radius_mm: 1.40,
      diocotron_mode_frequency_khz: 48.2,
      rotating_wall_amplitude_v: 2.4,
      confinement_time_margin_hours: 720.0,
      containment_status: "CRYOGENIC_STABLE_CONFINED",
    },
  ]);
}
