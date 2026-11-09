import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cellId = body.cell_id || "SINGULARITY-VAULT-GENEVA-01";
    const deltaRate = body.delta_rate_kg_s || 0.05;

    return NextResponse.json({
      cell_id: cellId,
      previous_rate_kg_s: 0.26,
      new_injection_rate_kg_s: Math.round((0.26 + deltaRate) * 1000) / 1000,
      mass_stabilization_state: "MASS_DRIFT_COMPENSATED",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

