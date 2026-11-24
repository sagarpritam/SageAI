import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/goldstone-wilczek-sentinel/sectors", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Goldstone-Wilczek Sentinel sectors:", err);
  }

  return NextResponse.json([
    {
      sector_id: "GOLDSTONE-WILCZEK-CORE-ALPHA",
      sector_name: "Chiral Bag Boundary Inflow",
      fractional_baryon_number_b: 0.500,
      chiral_angle_rad: 1.5708,
      bag_radius_fm: 0.85,
      sidechannel_rejection_db: -158.5,
      status: "CHIRAL_INFLOW_SEALED",
    },
    {
      sector_id: "SKYRMION-FRACTIONAL-BETA",
      sector_name: "Skyrme Field Topological Winding Boundary",
      fractional_baryon_number_b: 1.000,
      chiral_angle_rad: 3.1416,
      bag_radius_fm: 0.90,
      sidechannel_rejection_db: -158.0,
      status: "SKYRMION_WINDING_BOUND",
    },
    {
      sector_id: "AXIAL-BARYON-ANOMALY-GAMMA",
      sector_name: "Non-Perturbative Chiral Condensate Bag",
      fractional_baryon_number_b: 0.250,
      chiral_angle_rad: 0.7854,
      bag_radius_fm: 0.82,
      sidechannel_rejection_db: -159.2,
      status: "CONDENSATE_ANOMALY_LOCKED",
    },
    {
      sector_id: "SPECTRAL-FLOW-BARYON-DELTA",
      sector_name: "Dirac Sea Spectral Shift Invariant",
      fractional_baryon_number_b: 0.750,
      chiral_angle_rad: 2.3562,
      bag_radius_fm: 0.88,
      sidechannel_rejection_db: -160.0,
      status: "SPECTRAL_SHIFT_CONFINED",
    },
  ]);
}
