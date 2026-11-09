import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_mhd_vaults: 3,
    aggregate_rated_mhd_capacity_mw: 3850.0,
    completed_power_discharges: 28,
    primary_working_fluid: "SUPERCRITICAL_GEOTHERMAL_BRINE",
    magnetic_confinement: "TRANSVERSE_SUPERCONDUCTING_MAGNETIC_CHANNEL",
    vault_emp_faradaic_isolation: "CLASS_V_SUB_NANOSECOND_AIRGAP",
    status: "OPERATIONAL",
    timestamp: new Date().toISOString(),
  });
}
