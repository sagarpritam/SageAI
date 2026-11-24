import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/khovanov-homology-sentinel/sectors", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Khovanov Homology sectors:", err);
  }

  return NextResponse.json([
    {
      sector_id: "KHOVANOV-CORE-ALPHA",
      grading_coordinates: "(0, 1)",
      euler_characteristic_jones: 1.0,
      homology_dimension: 32,
      rejection_db: -166.0,
      status: "ARMED",
    },
    {
      sector_id: "FROBENIUS-ALGEBRA-BETA",
      grading_coordinates: "(1, 3)",
      euler_characteristic_jones: -1.0,
      homology_dimension: 32,
      rejection_db: -166.5,
      status: "ARMED",
    },
    {
      sector_id: "REIDEMEISTER-TRIAD-GAMMA",
      grading_coordinates: "(-1, -1)",
      euler_characteristic_jones: 2.0,
      homology_dimension: 32,
      rejection_db: -167.0,
      status: "ARMED",
    },
    {
      sector_id: "S-INVARIANT-DELTA",
      grading_coordinates: "(2, 5)",
      euler_characteristic_jones: 0.0,
      homology_dimension: 32,
      rejection_db: -166.2,
      status: "ARMED",
    },
  ]);
}
