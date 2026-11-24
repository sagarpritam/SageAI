import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/supersymmetric-localization/sectors", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Supersymmetric Localization sectors:", err);
    return NextResponse.json([
      {
        sector_id: "PESTUN-S4-LOCALIZATION",
        manifold_class: "Exact S4 Partition Function Z_S4",
        instanton_number_k: 4,
        matrix_integral_dimension: 64,
        partition_norm: 1.0,
        status: "LOCALIZATION_LOCUS_FIXED",
      },
      {
        sector_id: "NEKRASOV-INSTANTON-SUM",
        manifold_class: "Nekrasov Deformed Omega-Background Z_inst",
        instanton_number_k: 8,
        matrix_integral_dimension: 128,
        partition_norm: 1.0,
        status: "INSTANTON_SUM_CONVERGED",
      },
      {
        sector_id: "MATRIX-MODEL-SADDLE",
        manifold_class: "Eigenvalue Saddle Point Distribution rho(lambda)",
        instanton_number_k: 2,
        matrix_integral_dimension: 32,
        partition_norm: 1.0,
        status: "SADDLE_POINT_SOLVED",
      },
      {
        sector_id: "WILSON-LOOP-EXACT-VEV",
        manifold_class: "Circular BPS Wilson Loop VEV <W_circ>",
        instanton_number_k: 6,
        matrix_integral_dimension: 96,
        partition_norm: 1.0,
        status: "BPS_OBSERVABLE_SEALED",
      },
    ]);
  }
}
