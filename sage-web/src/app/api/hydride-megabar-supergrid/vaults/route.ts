import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_VAULTS = {
  vaults: [
    {
      vault_id: "MEGABAR-LAH10-VAULT-01",
      location: "Subterranean Megabar Lanthanum Decahydride (LaH_10) Power Chamber",
      cell_pressure_gpa: 175.0,
      superconducting_tc_k: 252.0,
      base_output_gw: 520.0,
      base_efficiency_pct: 99.12,
      status: "HYDRIDE_MEGABAR_COHERENT",
    },
    {
      vault_id: "LUNH-NITROGEN-TRUNK-02",
      location: "Trans-Continental Nitrogen-Doped Lutetium Hydride Cryo-Free Supergrid",
      cell_pressure_gpa: 1.2,
      superconducting_tc_k: 294.0,
      base_output_gw: 780.0,
      base_efficiency_pct: 99.45,
      status: "HYDRIDE_MEGABAR_COHERENT",
    },
    {
      vault_id: "ORBITAL-MEGABAR-RING-03",
      location: "Orbital Radiative High-Pressure Yttrium Nonahydride (YH_9) Storage Ring",
      cell_pressure_gpa: 210.0,
      superconducting_tc_k: 243.0,
      base_output_gw: 1150.0,
      base_efficiency_pct: 99.82,
      status: "HYDRIDE_MEGABAR_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/hydride-megabar-supergrid/vaults`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_VAULTS));
    }
    return NextResponse.json(FALLBACK_VAULTS);
  } catch {
    return NextResponse.json(FALLBACK_VAULTS);
  }
}
