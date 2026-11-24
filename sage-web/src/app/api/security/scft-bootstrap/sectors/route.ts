import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/scft-bootstrap/sectors", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback SCFT Bootstrap sectors:", err);
    return NextResponse.json([
      {
        sector_id: "MINIMAL-ARGYRES-DOUGLAS",
        scft_class: "Rank-1 (A1, A2) Argyres-Douglas Non-Lagrangian",
        chiral_algebra: "Vir_2_5_MINIMAL_MODEL",
        central_charge_c: 0.5,
        flavor_central_charge_k: 0.0,
        status: "NON_LAGRANGIAN_BOUNDED",
      },
      {
        sector_id: "SU2-NF4-SEIBERG-WITTEN",
        scft_class: "SU(2) with Nf=4 Fundamental Hypermultiplets",
        chiral_algebra: "SO(8)_LEVEL_MINUS_2_AFFINE",
        central_charge_c: 1.25,
        flavor_central_charge_k: 4.0,
        status: "S_DUALITY_CROSSING_SATISFIED",
      },
      {
        sector_id: "SCHUR-INDEX-CHIRAL-ALGEBRA",
        scft_class: "2D Chiral Vertex Operator Algebra (VOA)",
        chiral_algebra: "W_ALGEBRA_NILPOTENT_REDUCTION",
        central_charge_c: -1.0,
        flavor_central_charge_k: 3.0,
        status: "SCHUR_OPERATOR_CONFINED",
      },
      {
        sector_id: "CROSSING-SYMMETRY-SDPB",
        scft_class: "Semidefinite Functional Bound on OPE Coefficients",
        chiral_algebra: "SUPERCONFORMAL_BLOCK_EXPANSION",
        central_charge_c: 0.916667,
        flavor_central_charge_k: 2.666667,
        status: "UNITARITY_EXTREMAL_LOCKED",
      },
    ]);
  }
}
