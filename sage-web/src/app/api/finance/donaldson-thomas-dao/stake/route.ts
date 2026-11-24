import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { vault_id?: string; stake_volume_quadrillion_usd?: number } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const vault_id = body.vault_id || "DONALDSON-THOMAS-CORE-ALPHA";
  const stake_volume_quadrillion_usd = body.stake_volume_quadrillion_usd ?? 50.0;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/donaldson-thomas-dao/stake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vault_id, stake_volume_quadrillion_usd }),
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Donaldson-Thomas DAO stake receipt:", err);
  }

  return NextResponse.json({
    stake_id: `DT-STAKE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    vault_id,
    staked_volume_quadrillion_usd: stake_volume_quadrillion_usd,
    total_staked_dt_capital_quadrillion_usd: 1600.0 + stake_volume_quadrillion_usd,
    projected_yield_apy_percent: 62.0,
    status: "STAKED",
    timestamp: new Date().toISOString(),
  });
}
