import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      branch_id: "EVERETT-BRANCH-PRIME-01",
      branch_label: "Branch-Alpha: Consensus Sovereign Defense Baseline",
      pointer_basis_state: "|psi_0> (Kinetic Shield Locked)",
      amplitude_magnitude: 0.7483,
      probability_weight: 0.56,
      branch_phase_radians: 0.0,
      decoherence_factor: 0.998,
      threat_severity_projected: "NOMINAL",
      status: "BRANCH_SUPERPOSITION_COHERENT",
    },
    {
      branch_id: "EVERETT-BRANCH-ATTACK-02",
      branch_label: "Branch-Beta: Coordinated Hypersonic EMP Surge",
      pointer_basis_state: "|psi_1> (Grid Islanding Triggered)",
      amplitude_magnitude: 0.5099,
      probability_weight: 0.26,
      branch_phase_radians: 1.5708,
      decoherence_factor: 0.985,
      threat_severity_projected: "HIGH",
      status: "BRANCH_SUPERPOSITION_COHERENT",
    },
    {
      branch_id: "EVERETT-BRANCH-QUANTUM-03",
      branch_label: "Branch-Gamma: Post-Quantum Harvest Decoherence",
      pointer_basis_state: "|psi_2> (Honey-Chaff Discharged)",
      amplitude_magnitude: 0.3464,
      probability_weight: 0.12,
      branch_phase_radians: 3.1416,
      decoherence_factor: 0.972,
      threat_severity_projected: "ELEVATED",
      status: "BRANCH_SUPERPOSITION_COHERENT",
    },
    {
      branch_id: "EVERETT-BRANCH-METRIC-04",
      branch_label: "Branch-Delta: Spacetime Geodesic Metric Anomaly",
      pointer_basis_state: "|psi_3> (Cauchy Clamp Armed)",
      amplitude_magnitude: 0.2449,
      probability_weight: 0.06,
      branch_phase_radians: 4.7124,
      decoherence_factor: 0.964,
      threat_severity_projected: "EXTREME",
      status: "BRANCH_SUPERPOSITION_COHERENT",
    },
  ]);
}
