import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      brane_id: "RS-BRANE-GENEVA-01",
      facility_name: "CERN Large Hadron 5D Warped AdS5 Brane Resonator",
      bulk_curvature_scale_k_gev: 1.2e18,
      compactification_radius_rc_planck: 36.8,
      radion_mass_gev: 1520.0,
      warp_factor_exponent_k_pi_rc: 36.84,
      inter_brane_tension_ev4: 1.45e38,
      hierarchy_suppression_ratio: 1.0e-16,
      status: "BRANE_METRIC_LOCKED",
    },
    {
      brane_id: "RS-BRANE-FERMILAB-02",
      facility_name: "Fermilab Tevatron Deep 5D Warp Projection Rig",
      bulk_curvature_scale_k_gev: 1.1e18,
      compactification_radius_rc_planck: 36.5,
      radion_mass_gev: 1480.0,
      warp_factor_exponent_k_pi_rc: 36.52,
      inter_brane_tension_ev4: 1.38e38,
      hierarchy_suppression_ratio: 1.2e-16,
      status: "BRANE_METRIC_LOCKED",
    },
    {
      brane_id: "RS-BRANE-ORBITAL-03",
      facility_name: "High-Earth Orbit Clean Space Warped Metric Array",
      bulk_curvature_scale_k_gev: 1.35e18,
      compactification_radius_rc_planck: 37.2,
      radion_mass_gev: 1580.0,
      warp_factor_exponent_k_pi_rc: 37.18,
      inter_brane_tension_ev4: 1.55e38,
      hierarchy_suppression_ratio: 8.5e-17,
      status: "BRANE_METRIC_LOCKED",
    },
  ]);
}

