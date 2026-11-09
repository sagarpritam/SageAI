import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      horizon_id: "CAUCHY-HORIZON-KERR-01",
      spacetime_metric_type: "KERR_INNER_HORIZON",
      facility_name: "CERN High-Luminosity Cauchy Metric Vacuum Simulator",
      cauchy_surface_radius_m: 1.45e-17,
      angular_momentum_spin_a: 0.985,
      divergence_growth_rate_exponent: 4.0,
      chronology_protection_margin_db: 96.2,
      backreaction_clamp_latency_as: 780.0,
      status: "CAUCHY_HORIZON_PROTECTION_LOCKED",
    },
    {
      horizon_id: "CAUCHY-HORIZON-GODEL-02",
      spacetime_metric_type: "GODEL_ROTATING_UNIVERSE",
      facility_name: "Perimeter Institute Holographic CTC Boundary Chamber",
      cauchy_surface_radius_m: 2.80e-17,
      angular_momentum_spin_a: 0.992,
      divergence_growth_rate_exponent: 4.0,
      chronology_protection_margin_db: 94.8,
      backreaction_clamp_latency_as: 840.0,
      status: "CAUCHY_HORIZON_PROTECTION_LOCKED",
    },
    {
      horizon_id: "CAUCHY-HORIZON-MISNER-03",
      spacetime_metric_type: "MISNER_CYLINDER",
      facility_name: "Tokai Quantum Spacetime Chronology Enclave",
      cauchy_surface_radius_m: 0.95e-17,
      angular_momentum_spin_a: 0.965,
      divergence_growth_rate_exponent: 4.0,
      chronology_protection_margin_db: 92.5,
      backreaction_clamp_latency_as: 910.0,
      status: "CAUCHY_HORIZON_PROTECTION_LOCKED",
    },
  ]);
}
