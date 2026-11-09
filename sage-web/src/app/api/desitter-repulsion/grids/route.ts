import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      grid_id: "DESITTER-GRID-MAUNA-KEA-01",
      facility_name: "Mauna Kea Sub-Millimeter Horizon Repulsion Array",
      latitude: 19.8206,
      longitude: -155.4681,
      altitude_m: 4207.0,
      metamaterial_dipole_density_cm3: 5.2e18,
      resonant_polarizability_alpha0: 9.12e-39,
      effective_screening_radius_m: 150.0,
      de_sitter_horizon_coupling: 0.965,
      vacuum_repulsion_force_nn: 54.2,
      status: "HORIZON_DIPOLE_RESONANCE_LOCKED",
    },
    {
      grid_id: "DESITTER-GRID-SOUTH-POLE-02",
      facility_name: "Amundsen-Scott Cosmic Horizon Polarimeter Grid",
      latitude: -90.0,
      longitude: 0.0,
      altitude_m: 2835.0,
      metamaterial_dipole_density_cm3: 4.6e18,
      resonant_polarizability_alpha0: 8.20e-39,
      effective_screening_radius_m: 120.0,
      de_sitter_horizon_coupling: 0.938,
      vacuum_repulsion_force_nn: 46.8,
      status: "HORIZON_DIPOLE_RESONANCE_LOCKED",
    },
    {
      grid_id: "DESITTER-GRID-LAGRANGE-L2-03",
      facility_name: "Deep-Space James Webb Horizon Metamaterial Emitter",
      latitude: 0.0,
      longitude: 0.0,
      altitude_m: 1500000000.0,
      metamaterial_dipole_density_cm3: 6.8e18,
      resonant_polarizability_alpha0: 1.15e-38,
      effective_screening_radius_m: 280.0,
      de_sitter_horizon_coupling: 0.988,
      vacuum_repulsion_force_nn: 78.5,
      status: "HORIZON_DIPOLE_RESONANCE_LOCKED",
    },
  ]);
}
