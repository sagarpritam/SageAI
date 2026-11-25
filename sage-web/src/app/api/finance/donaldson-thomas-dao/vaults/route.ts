import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/donaldson-thomas-dao/vaults", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Donaldson-Thomas DAO vaults:", err);
  }

  return NextResponse.json([
    {
      vault_id: "DONALDSON-THOMAS-CORE-ALPHA",
      invariant_type: "BEHREND-CONSTRUCTIBLE-NU",
      staked_capital_quadrillion_usd: 440.0,
      projected_yield_apy_percent: 62.5,
      wall_crossing_phase: "CHAMBER-A",
      status: "ACTIVE",
    },
    {
      vault_id: "COHOMOLOGICAL-HALL-ALGEBRA-POOL",
      invariant_type: "KONTSEVICH-SOIBELMAN-COHA",
      staked_capital_quadrillion_usd: 400.0,
      projected_yield_apy_percent: 61.8,
      wall_crossing_phase: "CHAMBER-B",
      status: "ACTIVE",
    },
    {
      vault_id: "BRIDGELAND-WALL-CROSSING-DEX",
      invariant_type: "JOYCE-SONG-STABILITY-CONDITION",
      staked_capital_quadrillion_usd: 420.0,
      projected_yield_apy_percent: 62.2,
      wall_crossing_phase: "STABILITY-WALL",
      status: "ACTIVE",
    },
    {
      vault_id: "PANDHARIPANDE-THOMAS-VAULT",
      invariant_type: "PT-STABLE-PAIRS",
      staked_capital_quadrillion_usd: 340.0,
      projected_yield_apy_percent: 61.5,
      wall_crossing_phase: "CHAMBER-C",
      status: "ACTIVE",
    },
  ]);
}
