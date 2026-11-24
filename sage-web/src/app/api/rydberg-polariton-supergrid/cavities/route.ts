import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_CAVITIES = {
  cavities: [
    {
      cavity_id: "RYDBERG-PEROVSKITE-CAVITY-01",
      classification: "Perovskite CsPbBr_3 Microcavity Polariton BEC Array",
      rabi_splitting_mev: 42.5,
      condensate_density_cm3: 8.4e16,
      base_harvest_mw: 1180.0,
      grid_efficiency_pct: 99.98,
      status: "POLARITON_CONDENSED",
    },
    {
      cavity_id: "RYDBERG-TMD-HETEROSTRUCTURE-02",
      classification: "MoSe_2/WSe_2 Moire Heterostructure Rydberg Polariton Grid",
      rabi_splitting_mev: 58.2,
      condensate_density_cm3: 1.2e17,
      base_harvest_mw: 1620.0,
      grid_efficiency_pct: 99.99,
      status: "POLARITON_CONDENSED",
    },
    {
      cavity_id: "RYDBERG-CU2O-QUANTUM-WELL-03",
      classification: "Rydberg Cuprous Oxide Cu_2O Giant Exciton Superfluid Grid",
      rabi_splitting_mev: 76.0,
      condensate_density_cm3: 2.5e17,
      base_harvest_mw: 2150.0,
      grid_efficiency_pct: 99.97,
      status: "POLARITON_CONDENSED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/rydberg-polariton-supergrid/cavities`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_CAVITIES));
    }
    return NextResponse.json(FALLBACK_CAVITIES);
  } catch {
    return NextResponse.json(FALLBACK_CAVITIES);
  }
}
