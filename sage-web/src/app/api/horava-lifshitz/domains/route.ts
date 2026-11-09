import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      domain_id: "HORAVA-DOMAIN-TRANS-PLANCK-01",
      spacetime_sector: "Trans-Planckian Quantum Geometry Foliation Sector 1",
      dynamical_critical_exponent_z: 3.0,
      foliation_parameter_lambda: 1.002,
      spatial_curvature_order: 6,
      residual_lorentz_violation_pct: 0.00008,
      status: "ANISOTROPIC_LIFSHITZ_REGULARIZED",
    },
    {
      domain_id: "HORAVA-DOMAIN-ERGOSPHERE-02",
      spacetime_sector: "Kerr Metric Extreme Shear Boundary Cavity",
      dynamical_critical_exponent_z: 2.85,
      foliation_parameter_lambda: 1.004,
      spatial_curvature_order: 6,
      residual_lorentz_violation_pct: 0.00012,
      status: "ANISOTROPIC_LIFSHITZ_REGULARIZED",
    },
    {
      domain_id: "HORAVA-DOMAIN-ORBITAL-03",
      spacetime_sector: "Deep-Space Micro-Curvature Gauge Foliation",
      dynamical_critical_exponent_z: 1.05,
      foliation_parameter_lambda: 1.001,
      spatial_curvature_order: 2,
      residual_lorentz_violation_pct: 0.00003,
      status: "ANISOTROPIC_LIFSHITZ_REGULARIZED",
    },
  ]);
}

