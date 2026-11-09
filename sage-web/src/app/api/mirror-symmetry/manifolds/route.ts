import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    manifolds: [
      {
        manifold_id: "CY-MIRROR-FERMAT-QUINTIC-01",
        original_manifold: "Fermat Quintic Threefold in P^4 (X)",
        mirror_manifold: "Mirror Quintic Quotient X / (Z_5)^3 (W)",
        h_1_1_original: 1,
        h_2_1_original: 101,
        euler_characteristic_original: -200,
        h_1_1_mirror: 101,
        h_2_1_mirror: 1,
        euler_characteristic_mirror: 200,
        status: "MIRROR_SYMMETRY_ALIGNED",
      },
      {
        manifold_id: "CY-MIRROR-TIAN-YAU-02",
        original_manifold: "Complete Intersection Calabi-Yau (CICY Tian-Yau)",
        mirror_manifold: "Mirror Orbifold Fold (W_TY)",
        h_1_1_original: 14,
        h_2_1_original: 23,
        euler_characteristic_original: -18,
        h_1_1_mirror: 23,
        h_2_1_mirror: 14,
        euler_characteristic_mirror: 18,
        status: "MIRROR_SYMMETRY_ALIGNED",
      },
      {
        manifold_id: "CY-MIRROR-OCTIC-P11222-03",
        original_manifold: "Degree 8 Hypersurface in P(1,1,2,2,2)",
        mirror_manifold: "Mirror Weighted Projective Threefold",
        h_1_1_original: 2,
        h_2_1_original: 86,
        euler_characteristic_original: -168,
        h_1_1_mirror: 86,
        h_2_1_mirror: 2,
        euler_characteristic_mirror: 168,
        status: "MIRROR_SYMMETRY_ALIGNED",
      },
    ],
  });
}
