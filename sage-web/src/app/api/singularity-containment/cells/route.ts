import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      cell_id: "SINGULARITY-VAULT-GENEVA-01",
      facility_name: "CERN Graviton Confinement Chamber",
      mass_kg: 2.5e8,
      schwarzschild_radius_m: 3.71e-19,
      hawking_temperature_kelvin: 4.89e14,
      hawking_power_watts: 2.34e16,
      graviton_waveguide_field_tesla: 35.0,
      matter_injection_rate_kg_s: 0.26,
      evaporation_margin_years: 125000.0,
      containment_status: "MASS_EQUILIBRIUM_LOCKED",
    },
    {
      cell_id: "SINGULARITY-VAULT-CHEYENNE-02",
      facility_name: "Deep Crustal Graviton Facility Cheyenne",
      mass_kg: 3.2e8,
      schwarzschild_radius_m: 4.75e-19,
      hawking_temperature_kelvin: 3.82e14,
      hawking_power_watts: 1.42e16,
      graviton_waveguide_field_tesla: 35.0,
      matter_injection_rate_kg_s: 0.16,
      evaporation_margin_years: 260000.0,
      containment_status: "MASS_EQUILIBRIUM_LOCKED",
    },
    {
      cell_id: "SINGULARITY-VAULT-ORBITAL-AEGIS-03",
      facility_name: "Lagrange L2 Graviton Power Platform",
      mass_kg: 1.8e8,
      schwarzschild_radius_m: 2.67e-19,
      hawking_temperature_kelvin: 6.79e14,
      hawking_power_watts: 4.51e16,
      graviton_waveguide_field_tesla: 42.0,
      matter_injection_rate_kg_s: 0.5,
      evaporation_margin_years: 46000.0,
      containment_status: "MASS_EQUILIBRIUM_LOCKED",
    },
  ]);
}

