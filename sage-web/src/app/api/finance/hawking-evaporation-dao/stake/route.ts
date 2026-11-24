import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch("http://127.0.0.1:8000/api/finance/hawking-evaporation-dao/stake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Hawking Evaporation stake receipt:", err);
    return NextResponse.json({
      stake_id: `HAWKING-STAKE-${Date.now().toString(36).toUpperCase()}`,
      vault_id: "HAWKING-TEMPERATURE-CORE",
      staked_volume_quadrillion_usd: 65.0,
      accrued_evaporation_yield_apy: 43.5,
      hawking_luminosity_watts: 9.25e24,
      timestamp: new Date().toISOString(),
      status: "EVAPORATION_CAPITAL_STAKED",
    });
  }
}
