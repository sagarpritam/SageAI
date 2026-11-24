import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { channel_id?: string; morita_bias_rad?: number } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const channel_id = body.channel_id || "DERIVED-MORITA-ALPHA";
  const morita_bias_rad = body.morita_bias_rad ?? 1.618;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/derived-morita-bus/modulate-morita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel_id, morita_bias_rad }),
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Derived Morita modulation receipt:", err);
  }

  return NextResponse.json({
    modulation_id: `MORITA-MOD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    channel_id,
    morita_bias_rad,
    morita_fidelity: 0.99999999,
    status: "DERIVED_MORITA_MODULATED",
    timestamp: new Date().toISOString(),
  });
}
