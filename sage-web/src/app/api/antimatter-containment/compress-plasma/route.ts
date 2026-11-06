import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cellId = body.cell_id || "CELL-ALPHA-PENNING-01";
    const deltaV = body.delta_voltage_v || 0.5;
    const targetR = body.target_radius_mm || 1.45;

    return NextResponse.json({
      cell_id: cellId,
      previous_radius_mm: 1.65,
      compressed_plasma_radius_mm: targetR,
      rotating_wall_amplitude_v: 2.4 + deltaV,
      diocotron_suppression_ratio_db: -24.8,
      containment_integrity: "EXCELLENT",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
