import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/supergravity-green-schwarz/manifolds", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Supergravity Green-Schwarz manifolds:", err);
    return NextResponse.json([
      {
        manifold_id: "E8-XE8-HETEROTIC-STRING",
        gauge_group: "E8 x E8 Heterotic Gauge Holonomy",
        chiral_fermion_multiplets: 496,
        gravitational_curvature_order: "Tr(R^4)",
        anomaly_residue_norm: 0.0,
        status: "HEXAGON_LOOP_CANCELLED",
      },
      {
        manifold_id: "SO32-TYPE-I-SUPERGRAVITY",
        gauge_group: "SO(32) Open String & D9-Brane Sector",
        chiral_fermion_multiplets: 496,
        gravitational_curvature_order: "Tr(F^6)_CANCELLATION",
        anomaly_residue_norm: 0.0,
        status: "TYPE_I_TADPOLE_FREE",
      },
      {
        manifold_id: "TWELVE-FORM-FACTORIZATION",
        gauge_group: "Factorized Anomaly Polynomial Ring X4 ^ X8",
        chiral_fermion_multiplets: 512,
        gravitational_curvature_order: "Pontryagin_Classes_p1_p2",
        anomaly_residue_norm: 0.0,
        status: "POLYNOMIAL_FACTORIZED",
      },
      {
        manifold_id: "KALB-RAMOND-B2-AXION",
        gauge_group: "Two-Form B2 Kalb-Ramond Gauge Shift Invariance",
        chiral_fermion_multiplets: 1,
        gravitational_curvature_order: "dB2_CHERN_SIMONS_MODIFIED",
        anomaly_residue_norm: 0.0,
        status: "AXION_MODIFIED_BIANCHI_LOCKED",
      },
    ]);
  }
}
