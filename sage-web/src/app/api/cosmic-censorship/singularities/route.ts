import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      node_id: "CENSORSHIP-NODE-SAG-A-01",
      target_singularity_label: "Sagittarius A* Galactic Center Kerr Horizon Monitor",
      black_hole_mass_solar: 4.15e6,
      spin_parameter_a_over_m: 0.94,
      charge_parameter_q_over_m: 0.02,
      outer_horizon_radius_km: 1.22e7,
      kretschmann_scalar_curvature_m4: 1.8e-32,
      naked_singularity_risk_level: "NOMINAL",
      status: "HORIZON_CAUSALLY_CLOAKED",
    },
    {
      node_id: "CENSORSHIP-NODE-CYGNUS-X1-02",
      target_singularity_label: "Cygnus X-1 Near-Extremal High-Spin Accretor",
      black_hole_mass_solar: 21.2,
      spin_parameter_a_over_m: 0.985,
      charge_parameter_q_over_m: 0.04,
      outer_horizon_radius_km: 62.4,
      kretschmann_scalar_curvature_m4: 2.4e-14,
      naked_singularity_risk_level: "ELEVATED",
      status: "HORIZON_CAUSALLY_CLOAKED",
    },
    {
      node_id: "CENSORSHIP-NODE-LAB-SINGULARITY-03",
      target_singularity_label: "CERN Micro-Kerr Laboratory Geodesic Cavity",
      black_hole_mass_solar: 1.5e-26,
      spin_parameter_a_over_m: 0.998,
      charge_parameter_q_over_m: 0.01,
      outer_horizon_radius_km: 4.4e-29,
      kretschmann_scalar_curvature_m4: 8.5e120,
      naked_singularity_risk_level: "CRITICAL",
      status: "HORIZON_CAUSALLY_CLOAKED",
    },
  ]);
}

