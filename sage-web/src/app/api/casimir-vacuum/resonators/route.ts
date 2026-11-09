import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      resonator_id: "CASIMIR-CAVITY-DELFT-01",
      facility_name: "Delft Superconducting Quantum Cavity Lab",
      latitude: 52.0067,
      longitude: 4.3556,
      altitude_m: 1.0,
      squid_junction_count: 300,
      microwave_cavity_freq_ghz: 10.5,
      boundary_modulation_velocity_c: 0.28,
      photon_pair_flux_per_second: 5.2e11,
      squeezing_factor_db: 15.1,
      cryo_temperature_mk: 12.0,
      status: "SUPERCONDUCTING_SQUID_RESONANT",
    },
    {
      resonator_id: "CASIMIR-CAVITY-BOULDER-02",
      facility_name: "NIST Boulder Micro-Waveguide Facility",
      latitude: 40.0150,
      longitude: -105.2705,
      altitude_m: 1655.0,
      squid_junction_count: 250,
      microwave_cavity_freq_ghz: 9.8,
      boundary_modulation_velocity_c: 0.24,
      photon_pair_flux_per_second: 4.5e11,
      squeezing_factor_db: 13.8,
      cryo_temperature_mk: 15.0,
      status: "SUPERCONDUCTING_SQUID_RESONANT",
    },
    {
      resonator_id: "CASIMIR-CAVITY-GENEVA-03",
      facility_name: "CERN Sub-Kelvin Vacuum Cryo-Rig",
      latitude: 46.2044,
      longitude: 6.1432,
      altitude_m: 375.0,
      squid_junction_count: 400,
      microwave_cavity_freq_ghz: 11.2,
      boundary_modulation_velocity_c: 0.32,
      photon_pair_flux_per_second: 6.8e11,
      squeezing_factor_db: 16.4,
      cryo_temperature_mk: 8.5,
      status: "SUPERCONDUCTING_SQUID_RESONANT",
    },
  ]);
}

