import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  sites: [
    {
      site_id: "TOPOS-ETALE-Z3-01",
      classification: "Etale Grothendieck Site Sh(C_etale) Sovereign Sheaf",
      default_sheaf_dimension: 8,
      default_cech_cover_rank: 12,
      default_omega_depth: 6,
      base_unitarity_pct: 99.9972,
      base_suppression_db: 162.1,
      status: "TOPOS_SHEAF_LOCKED",
    },
    {
      site_id: "LAWVERE-TIERNEY-SHEAF-02",
      classification: "Lawvere-Tierney Modal Topology j: Omega -> Omega Classifier",
      default_sheaf_dimension: 12,
      default_cech_cover_rank: 16,
      default_omega_depth: 8,
      base_unitarity_pct: 99.9981,
      base_suppression_db: 164.2,
      status: "TOPOS_SHEAF_LOCKED",
    },
    {
      site_id: "CECH-GROTHENDIECK-STACK-03",
      classification: "Higher Deligne-Mumford Cech Descent Stack Sheaf",
      default_sheaf_dimension: 16,
      default_cech_cover_rank: 24,
      default_omega_depth: 10,
      base_unitarity_pct: 99.999,
      base_suppression_db: 166.7,
      status: "TOPOS_SHEAF_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/topos-grothendieck-firewall/sites`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_DATA);
}

