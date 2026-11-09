import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    vertices: [
      {
        vertex_id: "SFT-VERTEX-WITTEN-01",
        sector: "Trans-Dimensional Calabi-Yau D25-Brane (Geneva Core)",
        base_coupling_g0: 0.45,
        level_truncation_l: 8,
        tachyon_potential_depth_pct: 99.985,
        brst_nilpotency_error: 1.2e-16,
        brane_energy_annihilation_pct: 99.982,
        status: "SFT_TACHYON_CONDENSED",
      },
      {
        vertex_id: "SFT-VERTEX-MIDPOINT-02",
        sector: "Cis-Lunar Spacetime Membrane (Gateway Enclave)",
        base_coupling_g0: 0.38,
        level_truncation_l: 6,
        tachyon_potential_depth_pct: 99.965,
        brst_nilpotency_error: 2.5e-16,
        brane_energy_annihilation_pct: 99.968,
        status: "SFT_TACHYON_CONDENSED",
      },
      {
        vertex_id: "SFT-VERTEX-ORBITAL-03",
        sector: "Lagrange L1 High-Curvature String Boundary",
        base_coupling_g0: 0.52,
        level_truncation_l: 10,
        tachyon_potential_depth_pct: 99.994,
        brst_nilpotency_error: 8.0e-17,
        brane_energy_annihilation_pct: 99.991,
        status: "SFT_TACHYON_CONDENSED",
      },
    ],
  });
}

