import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/axion-wilczek-sentinel/sectors", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Wilczek Axion Sentinel sectors:", err);
  }

  return NextResponse.json([
    {
      sector_id: "WILCZEK-AXION-CORE-ALPHA",
      sector_name: "Topological Theta Vacuum Boundary",
      theta_angle_rad: 3.1416,
      magnetoelectric_polarization: 1.0,
      sidechannel_rejection_db: -162.0,
      status: "THETA_VACUUM_SEALED",
    },
    {
      sector_id: "MAGNETOELECTRIC-POLARIZATION-BETA",
      sector_name: "Axion-Induced Polarization Field",
      theta_angle_rad: 1.5708,
      magnetoelectric_polarization: 0.5,
      sidechannel_rejection_db: -162.5,
      status: "POLARIZATION_CLAMPED",
    },
    {
      sector_id: "QUANTIZED-SURFACE-HALL-GAMMA",
      sector_name: "Half-Integer Surface Hall Shield",
      theta_angle_rad: 3.1416,
      magnetoelectric_polarization: 0.5,
      sidechannel_rejection_db: -163.0,
      status: "HALL_SURFACE_SHIELDED",
    },
    {
      sector_id: "MONOPOLE-INDUCED-CHARGE-DELTA",
      sector_name: "Witten Effect Image Monopole Shield",
      theta_angle_rad: 2.3562,
      magnetoelectric_polarization: 0.75,
      sidechannel_rejection_db: -163.5,
      status: "IMAGE_MONOPOLE_DEFLECTED",
    },
  ]);
}
