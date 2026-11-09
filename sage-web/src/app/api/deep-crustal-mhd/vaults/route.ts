import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      vault_id: "MHD-VAULT-ICELAND-01",
      vault_name: "Reykjanes Deep-Crustal Supercritical MHD Vault",
      depth_kilometers: 4.8,
      geothermal_brine_temp_celsius: 520.0,
      brine_pressure_mpa: 28.5,
      superconducting_b_field_tesla: 8.5,
      brine_conductivity_siemens_m: 42.0,
      rated_mhd_output_mw: 950.0,
      vault_hardening_rating: "DEEP_BATHOLITH_CLASS_V",
      status: "MHD_BASELOAD_GENERATING",
    },
    {
      vault_id: "MHD-VAULT-NEVADA-02",
      vault_name: "Great Basin Granitic Batholith Kinetic Vault & Generator",
      depth_kilometers: 6.2,
      geothermal_brine_temp_celsius: 485.0,
      brine_pressure_mpa: 31.0,
      superconducting_b_field_tesla: 9.0,
      brine_conductivity_siemens_m: 38.5,
      rated_mhd_output_mw: 1250.0,
      vault_hardening_rating: "DEEP_BATHOLITH_CLASS_V",
      status: "MHD_BASELOAD_GENERATING",
    },
    {
      vault_id: "MHD-VAULT-NEW-ZEALAND-03",
      vault_name: "Taupo Volcanic Subduction Zone MHD Array",
      depth_kilometers: 5.5,
      geothermal_brine_temp_celsius: 580.0,
      brine_pressure_mpa: 34.0,
      superconducting_b_field_tesla: 8.8,
      brine_conductivity_siemens_m: 46.2,
      rated_mhd_output_mw: 1650.0,
      vault_hardening_rating: "DEEP_BATHOLITH_CLASS_V",
      status: "MHD_BASELOAD_GENERATING",
    },
  ]);
}

