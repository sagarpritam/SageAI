import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/tknn-chern-sentinel/sectors", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback TKNN Chern Sentinel sectors:", err);
  }

  return NextResponse.json([
    {
      sector_id: "TKNN-FIRST-CHERN-ALPHA",
      sector_name: "TKNN Quantized Hall Conductance Core",
      first_chern_number: 1,
      chern_flux_rad: 1.5708,
      berry_curvature_integral: 6.2832,
      sidechannel_rejection_db: -160.0,
      status: "CHERN_NUMBER_QUANTIZED",
    },
    {
      sector_id: "BERRY-CURVATURE-FLUX-BETA",
      sector_name: "Berry Curvature Brillouin Zone Manifold",
      first_chern_number: 1,
      chern_flux_rad: 3.1416,
      berry_curvature_integral: 6.2832,
      sidechannel_rejection_db: -160.0,
      status: "BERRY_FLUX_INTEGRATED",
    },
    {
      sector_id: "DIRAC-MONOPOLE-BUNDLE-GAMMA",
      sector_name: "Topological U(1) Principal Fiber Bundle",
      first_chern_number: 1,
      chern_flux_rad: 0.7854,
      berry_curvature_integral: 6.2832,
      sidechannel_rejection_db: -161.5,
      status: "FIBER_BUNDLE_LOCKED",
    },
    {
      sector_id: "KUBO-CONDUCTIVITY-DELTA",
      sector_name: "Kubo Formula Dissipationless Hall Channel",
      first_chern_number: 1,
      chern_flux_rad: 2.3562,
      berry_curvature_integral: 6.2832,
      sidechannel_rejection_db: -162.0,
      status: "KUBO_CHANNEL_SHIELDED",
    },
  ]);
}
