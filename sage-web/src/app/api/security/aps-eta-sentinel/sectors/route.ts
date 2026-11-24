import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/aps-eta-sentinel/sectors", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback APS Eta sectors:", err);
  }

  return NextResponse.json([
    {
      sector_id: "APS-SPECTRAL-CORE-ALPHA",
      boundary_condition: "P_PLUS-ATIYAH-PATODI-SINGER",
      eta_zero_value: 0.5,
      spectral_flow: 12,
      rejection_db: -168.0,
      status: "ARMED",
    },
    {
      sector_id: "BOUNDARY-ANOMALY-BETA",
      boundary_condition: "PARITY-ANOMALY-CANCELLATION",
      eta_zero_value: -0.25,
      spectral_flow: 12,
      rejection_db: -168.5,
      status: "ARMED",
    },
    {
      sector_id: "SPECTRAL-FLOW-GAMMA",
      boundary_condition: "ZERO-MODE-CROSSING-CHAMBER",
      eta_zero_value: 0.75,
      spectral_flow: 12,
      rejection_db: -169.0,
      status: "ARMED",
    },
    {
      sector_id: "GRAVITATIONAL-INSTANTON-DELTA",
      boundary_condition: "EGUCHI-HANSON-ORBIFOLD-S3",
      eta_zero_value: 0.125,
      spectral_flow: 12,
      rejection_db: -168.2,
      status: "ARMED",
    },
  ]);
}
