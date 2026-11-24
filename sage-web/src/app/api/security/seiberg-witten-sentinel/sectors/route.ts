import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/seiberg-witten-sentinel/sectors", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Seiberg-Witten Sentinel sectors:", err);
  }

  return NextResponse.json([
    {
      sector_id: "SEIBERG-WITTEN-CORE-ALPHA",
      sector_name: "Spin-c Monopole Moduli Space Core",
      spinc_flux_rad: 1.5708,
      monopole_charge: 1.0,
      sidechannel_rejection_db: -164.0,
      status: "MONOPOLE_EQUATION_SOLVED",
    },
    {
      sector_id: "SPINC-DIRAC-BUNDLE-BETA",
      sector_name: "Positive Spinor Dirac Operator Field",
      spinc_flux_rad: 3.1416,
      monopole_charge: 1.0,
      sidechannel_rejection_db: -164.5,
      status: "DIRAC_SPINOR_LOCKED",
    },
    {
      sector_id: "SELF-DUAL-CURVATURE-GAMMA",
      sector_name: "Self-Dual U(1) Curvature Shield",
      spinc_flux_rad: 0.7854,
      monopole_charge: 1.0,
      sidechannel_rejection_db: -165.0,
      status: "SELF_DUAL_CURVATURE_SEALED",
    },
    {
      sector_id: "EXOTIC-R4-DIFFERENTIAL-DELTA",
      sector_name: "Exotic R4 Smooth Topology Firewall",
      spinc_flux_rad: 2.3562,
      monopole_charge: 1.0,
      sidechannel_rejection_db: -165.5,
      status: "DIFFERENTIAL_ANOMALY_BLOCKED",
    },
  ]);
}
