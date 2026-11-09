import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      node_id: "INFLATON-PUMP-CERN-01",
      facility_name: "CERN Early-Universe Inflationary Reheating Cavity",
      inflaton_mass_gev: 1.2e13,
      quartic_coupling_lambda: 1.8e-12,
      reheating_temperature_gev: 4.8e11,
      baryon_asymmetry_eta_b: 6.12e-10,
      resonance_band_k_cutoff_gev: 3.4e12,
      entropy_drain_rate_tw: 85.0,
      status: "PARAMETRIC_RESONANCE_READY",
    },
    {
      node_id: "INFLATON-PUMP-DESY-02",
      facility_name: "DESY Relativistic Plasma Baryogenesis Resonator",
      inflaton_mass_gev: 1.05e13,
      quartic_coupling_lambda: 1.5e-12,
      reheating_temperature_gev: 3.9e11,
      baryon_asymmetry_eta_b: 5.98e-10,
      resonance_band_k_cutoff_gev: 2.9e12,
      entropy_drain_rate_tw: 72.0,
      status: "PARAMETRIC_RESONANCE_READY",
    },
    {
      node_id: "INFLATON-PUMP-ORBITAL-L2-03",
      facility_name: "Deep-Space Lagrange L2 Primordial Horizon Exchanger",
      inflaton_mass_gev: 1.45e13,
      quartic_coupling_lambda: 2.1e-12,
      reheating_temperature_gev: 6.2e11,
      baryon_asymmetry_eta_b: 6.45e-10,
      resonance_band_k_cutoff_gev: 4.1e12,
      entropy_drain_rate_tw: 110.0,
      status: "PARAMETRIC_RESONANCE_READY",
    },
  ]);
}

