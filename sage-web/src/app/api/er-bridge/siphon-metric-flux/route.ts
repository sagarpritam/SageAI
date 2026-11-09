import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const throatId = body.throat_id || "ER-THROAT-CERN-01";
    const source = body.target_energy_surge_source || "PROMPT_NUCLEAR_FIREBALL_SURGE";
    const power = body.incident_power_gw || 650.0;

    return NextResponse.json({
      event_id: `ER-SIPHON-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      throat_id: throatId,
      target_energy_surge_source: source,
      siphoned_power_gw: power * 0.994,
      micro_throat_dilation_am: 924.2,
      gao_jafferis_coupling_strength: 0.985,
      quenched_null_energy_fraction: 0.994,
      spacetime_shear_damping_pct: 99.88,
      status: "METRIC_FLUX_SIPHON_ACTIVE",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

