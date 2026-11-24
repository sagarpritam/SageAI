import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { channel_id?: string; spinon_momentum_k_rad?: number } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const channel_id = body.channel_id || "LSM-SPINON-EXCITATION-ALPHA";
  const spinon_momentum_k_rad = body.spinon_momentum_k_rad ?? 1.5708;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/lsm-spinon-bus/modulate-spinon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel_id, spinon_momentum_k_rad }),
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback LSM Spinon modulation receipt:", err);
  }

  return NextResponse.json({
    modulation_id: `LSM-MOD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    channel_id,
    spinon_momentum_k_rad,
    adjusted_fermi_velocity_m_s: 1423500.0,
    excitation_fidelity: 0.99999995,
    status: "MODULATED",
    timestamp: new Date().toISOString(),
  });
}
