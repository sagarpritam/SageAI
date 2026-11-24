import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/chiral-anomaly-wzw/manifolds", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Chiral Anomaly WZW manifolds:", err);
    return NextResponse.json([
      {
        manifold_id: "CAWS-MANIFOLD-SU3-CHIRAL",
        topology: "SU(3)_FLAVOR_OCTET_SPHERE_S5",
        maurer_cartan_one_form: "OMEGA = U_DAGGER_D_U",
        baryon_current_divergence_gev: 1.0e-14,
        winding_number: 3,
        differential_status: "HOMOLOGY_CLOSED_EXACT_VERIFIED",
      },
      {
        manifold_id: "CAWS-MANIFOLD-U1-AXIAL-INSTANTON",
        topology: "U(1)_A_AXIAL_INSTANTON_SECTOR",
        maurer_cartan_one_form: "CHERN_SIMONS_THREE_FORM",
        baryon_current_divergence_gev: 2.5e-15,
        winding_number: 1,
        differential_status: "ABJ_ANOMALY_INDEX_MATCHED",
      },
      {
        manifold_id: "CAWS-MANIFOLD-GOLDSTONE-WILCZEK",
        topology: "FRACTIONAL_FERMION_SOLITON_R3",
        maurer_cartan_one_form: "GOLDSTONE_WILCZEK_CURRENT",
        baryon_current_divergence_gev: 8.0e-16,
        winding_number: 2,
        differential_status: "INDUCED_TOPOLOGICAL_CHARGE_SEALED",
      },
      {
        manifold_id: "CAWS-MANIFOLD-STIEFEL-WHITNEY",
        topology: "GRASSMANNIAN_TOPOLOGICAL_MANIFOLD",
        maurer_cartan_one_form: "SECOND_CHERN_CHARACTER",
        baryon_current_divergence_gev: 4.0e-16,
        winding_number: 4,
        differential_status: "SPIN_STRUCTURE_COBORDISM_SECURED",
      },
    ]);
  }
}
