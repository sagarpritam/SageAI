import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "MAJORANA-NANOWIRE-ARRAY-01",
      location: "Equatorial InSb Semiconductor-Superconductor Kitaev Nanowire Harvester",
      default_topological_gap_muev: 640.0,
      majorana_braid_order: 4,
      base_output_gw: 365.0,
      base_efficiency_pct: 98.62,
      status: "MAJORANA_ZERO_COHERENT",
    },
    {
      array_id: "TOPOLOGICAL-BRAID-HVDC-02",
      location: "Trans-Continental Non-Abelian Braided Parity-Protected HVDC Trunk",
      default_topological_gap_muev: 820.0,
      majorana_braid_order: 6,
      base_output_gw: 526.0,
      base_efficiency_pct: 99.08,
      status: "MAJORANA_ZERO_COHERENT",
    },
    {
      array_id: "PARITY-PROTECTED-RING-03",
      location: "Orbital Fermion-Parity Topological Quantum Rectification Ring",
      default_topological_gap_muev: 1150.0,
      majorana_braid_order: 8,
      base_output_gw: 738.0,
      base_efficiency_pct: 99.49,
      status: "MAJORANA_ZERO_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/majorana-zero-supergrid/arrays`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_DATA);
}
