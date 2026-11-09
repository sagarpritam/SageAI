import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      throat_id: "ER-THROAT-CERN-01",
      facility_name: "CERN Large Hadron ER-Bridge Vacuum Resonator",
      throat_radius_attometers: 920.0,
      entangled_bell_qubit_pairs: 1200000,
      negative_casimir_energy_density_j_m3: -5.2e18,
      traversable_window_picoseconds: 28.4,
      siphon_throughput_capacity_gw: 820.0,
      status: "ER_EPR_THROAT_TRAVERSABLE",
    },
    {
      throat_id: "ER-THROAT-GRAN-SASSO-02",
      facility_name: "Gran Sasso Subterranean Topological Throat Vault",
      throat_radius_attometers: 840.0,
      entangled_bell_qubit_pairs: 980000,
      negative_casimir_energy_density_j_m3: -4.6e18,
      traversable_window_picoseconds: 22.8,
      siphon_throughput_capacity_gw: 710.0,
      status: "ER_EPR_THROAT_TRAVERSABLE",
    },
    {
      throat_id: "ER-THROAT-ORBITAL-L1-03",
      facility_name: "Lagrange L1 Deep-Space Micro-Wormhole Siphon Array",
      throat_radius_attometers: 1150.0,
      entangled_bell_qubit_pairs: 1800000,
      negative_casimir_energy_density_j_m3: -6.8e18,
      traversable_window_picoseconds: 36.2,
      siphon_throughput_capacity_gw: 1250.0,
      status: "ER_EPR_THROAT_TRAVERSABLE",
    },
  ]);
}

