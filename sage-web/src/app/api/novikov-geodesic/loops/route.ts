import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      loop_id: "NOVIKOV-LOOP-CYLINDER-01",
      spacetime_region: "Tipler Cylindrical Spacetime Metric Region A",
      proper_time_period_femtoseconds: 48.2,
      ctc_winding_number: 1,
      self_interaction_cross_section_b: 1.45e-31,
      unnormalized_paradox_probability: 0.142,
      topological_phase_slip_radians: 0.045,
      status: "CLOSED_TIMELIKE_LOOP_UNNORMALIZED",
    },
    {
      loop_id: "NOVIKOV-LOOP-GOTT-02",
      spacetime_region: "Gott Cosmic String Pair Intersection Sector",
      proper_time_period_femtoseconds: 124.5,
      ctc_winding_number: 2,
      self_interaction_cross_section_b: 2.88e-31,
      unnormalized_paradox_probability: 0.285,
      topological_phase_slip_radians: 0.089,
      status: "CLOSED_TIMELIKE_LOOP_UNNORMALIZED",
    },
    {
      loop_id: "NOVIKOV-LOOP-KERR-03",
      spacetime_region: "Extreme Kerr Ergosphere Chrono-Geodesic Cavity",
      proper_time_period_femtoseconds: 210.0,
      ctc_winding_number: 1,
      self_interaction_cross_section_b: 4.12e-31,
      unnormalized_paradox_probability: 0.318,
      topological_phase_slip_radians: 0.112,
      status: "CLOSED_TIMELIKE_LOOP_UNNORMALIZED",
    },
  ]);
}

