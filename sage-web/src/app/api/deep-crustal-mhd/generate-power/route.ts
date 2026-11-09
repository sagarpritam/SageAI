import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vaultId = body.vault_id || "MHD-VAULT-ICELAND-01";
    const vFactor = body.brine_velocity_factor || 1.0;
    const lFactor = body.load_factor || 0.85;

    return NextResponse.json({
      discharge_id: `MHD-POWER-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      vault_id: vaultId,
      brine_flow_velocity_m_s: 18.5 * vFactor,
      generated_mhd_power_mw: 950.0 * vFactor * lFactor,
      hall_parameter_beta: 0.42,
      mhd_generator_efficiency_pct: 88.4,
      vault_internal_power_allocated_mw: 95.0,
      sovereign_grid_export_mw: 712.5 * vFactor,
      subterranean_isolation_confirmed: true,
      status: "MHD_SUPERCRITICAL_BASELOAD_ACTIVE",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

