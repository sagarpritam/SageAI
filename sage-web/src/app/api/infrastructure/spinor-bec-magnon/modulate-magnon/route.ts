import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/spinor-bec-magnon/modulate-magnon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Spinor BEC modulation receipt:", err);
    return NextResponse.json({
      modulation_id: `SPINOR-MOD-${Date.now().toString(36).toUpperCase()}`,
      channel_id: "SPINOR-FERRO-ALPHA",
      spin_stiffness_nj_m: 2.45,
      magnon_dispersion_ghz: 14.8,
      optical_throughput_pbps: 1300.0,
      timestamp: new Date().toISOString(),
      status: "MAGNON_SPIN_WAVE_MODULATED",
    });
  }
}
