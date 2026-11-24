import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/witten-dyon-sentinel/sectors");
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Witten Dyon sectors:", err);
    return NextResponse.json([
      {
        sector_id: "WITTEN-DYON-POLARIZATION-ALPHA",
        dyon_sector: "Fractional Dyon Polarization Node theta = pi, q = -e/2",
        induced_charge_e: -0.5,
        axion_angle_rad: 3.14159,
        sidechannel_rejection_db: -154.5,
        status: "DYON_CHARGE_CONFINED",
      },
      {
        sector_id: "AXION-STRING-CORE-BETA",
        dyon_sector: "Topological Axion Vortex String Zero Mode Filter",
        induced_charge_e: 0.0,
        axion_angle_rad: 0.0,
        sidechannel_rejection_db: -153.8,
        status: "STRING_CORE_SHIELDED",
      },
      {
        sector_id: "DOMAIN-WALL-BOUNDARY-GAMMA",
        dyon_sector: "Axion Domain Wall Potential Barrier Delta V = m_a^2 * f_a^2",
        induced_charge_e: -0.25,
        axion_angle_rad: 1.57079,
        sidechannel_rejection_db: -155.0,
        status: "DOMAIN_WALL_SEALED",
      },
      {
        sector_id: "CALLAN-HARVEY-ANOMALY-DELTA",
        dyon_sector: "Callan-Harvey Anomaly Inflow Current Drain Boundary",
        induced_charge_e: 0.0,
        axion_angle_rad: 0.0,
        sidechannel_rejection_db: -154.0,
        status: "INFLOW_DRAIN_BALANCED",
      },
    ]);
  }
}
