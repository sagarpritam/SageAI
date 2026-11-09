import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      matrix_id: "ANYON-CORE-COPENHAGEN-01",
      facility_name: "Niels Bohr Majorana Nanowire Cryo-Lattice",
      anyon_model: "MAJORANA_ZERO_MODES",
      active_topological_qubits: 24,
      braiding_junctions: 96,
      majorana_modes_count: 48,
      decoherence_suppression_ratio_db: 88.2,
      topological_energy_gap_mev: 0.48,
      cryo_temp_mk: 15.0,
      status: "TOPOLOGICAL_GAP_PROTECTED",
    },
    {
      matrix_id: "ANYON-CORE-SANTA-BARBARA-02",
      facility_name: "Station Q Fractional Quantum Hall Matrix",
      anyon_model: "FIBONACCI_NON_ABELIAN",
      active_topological_qubits: 32,
      braiding_junctions: 128,
      majorana_modes_count: 64,
      decoherence_suppression_ratio_db: 92.5,
      topological_energy_gap_mev: 0.52,
      cryo_temp_mk: 10.0,
      status: "TOPOLOGICAL_GAP_PROTECTED",
    },
    {
      matrix_id: "ANYON-CORE-ORBITAL-CRYONET-03",
      facility_name: "Lagrange L1 Deep Space Topological QPU Pod",
      anyon_model: "FIBONACCI_NON_ABELIAN",
      active_topological_qubits: 64,
      braiding_junctions: 256,
      majorana_modes_count: 128,
      decoherence_suppression_ratio_db: 96.8,
      topological_energy_gap_mev: 0.65,
      cryo_temp_mk: 5.0,
      status: "TOPOLOGICAL_GAP_PROTECTED",
    },
  ]);
}

