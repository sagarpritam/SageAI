import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodes: [
      {
        node_id: "TETRAD-NODE-WEITZENBOCK-01",
        location: "Sovereign Deep-Space Observatory (Lagrange L2)",
        base_torsion_scalar_m2: -1.45e-26,
        tetrad_orthogonality_loss: 1.2e-14,
        f_t_coupling_constant: 0.042,
        inertia_decoupling_pct: 99.982,
        riemann_curvature_residual: 0.0,
        status: "TORSION_ALIGNED_ACTIVE",
      },
      {
        node_id: "TETRAD-NODE-HAYWARD-02",
        location: "Subterranean Gravitational Core (Geneva Vault)",
        base_torsion_scalar_m2: -2.85e-26,
        tetrad_orthogonality_loss: 8.5e-15,
        f_t_coupling_constant: 0.058,
        inertia_decoupling_pct: 99.991,
        riemann_curvature_residual: 0.0,
        status: "TORSION_ALIGNED_ACTIVE",
      },
      {
        node_id: "TETRAD-NODE-CISLUNAR-03",
        location: "Cis-Lunar Orbital Gateway (Station Alpha)",
        base_torsion_scalar_m2: -1.12e-26,
        tetrad_orthogonality_loss: 2.1e-14,
        f_t_coupling_constant: 0.035,
        inertia_decoupling_pct: 99.975,
        riemann_curvature_residual: 0.0,
        status: "TORSION_ALIGNED_ACTIVE",
      },
    ],
  });
}

