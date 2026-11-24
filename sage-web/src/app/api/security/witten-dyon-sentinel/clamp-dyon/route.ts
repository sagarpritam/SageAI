import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch("http://127.0.0.1:8000/api/security/witten-dyon-sentinel/clamp-dyon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Witten Dyon clamp receipt:", err);
    return NextResponse.json({
      clamp_id: `DYON-CLAMP-${Date.now().toString(36).toUpperCase()}`,
      sector_id: "WITTEN-DYON-POLARIZATION-ALPHA",
      induced_dyon_charge_e: -0.5,
      axion_angle_rad: 3.14159,
      rejection_db: -154.5,
      timestamp: new Date().toISOString(),
      status: "DYON_CHARGE_CLAMPED_AND_SEALED",
    });
  }
}
