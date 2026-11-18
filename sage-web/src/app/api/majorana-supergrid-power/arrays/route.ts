import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_ARRAYS = {
  arrays: [
    {
      array_id: "MZM-KODIAK-INAS-01",
      location: "Kodiak Sub-Arctic Cryogenic Nanowire Array Alpha",
      nanowire_material: "Epitaxial InAs / Al Superconductor Heterostructure",
      num_nanowires: 12800,
      topological_gap_mev: 1.45,
      zero_bias_conductance_g0: 2.0,
      base_output_mw: 8400.0,
      status: "TOPOLOGICAL_SUPERGRID_SYNCHRONIZED",
    },
    {
      array_id: "MZM-SVALBARD-SEAL-02",
      location: "Svalbard Permafrost Majorana Core Matrix Beta",
      nanowire_material: "InSb / NbTiN High-Field Quantum Wire Mesh",
      num_nanowires: 25600,
      topological_gap_mev: 1.82,
      zero_bias_conductance_g0: 2.0,
      base_output_mw: 14200.0,
      status: "TOPOLOGICAL_SUPERGRID_SYNCHRONIZED",
    },
    {
      array_id: "MZM-ANTARCTIC-DOME-03",
      location: "Dome C Antarctic High-Plateau Deep-Cryo Central Grid",
      nanowire_material: "Topological Insulator Bi2Se3 Superconducting Superlattice",
      num_nanowires: 51200,
      topological_gap_mev: 2.25,
      zero_bias_conductance_g0: 2.0,
      base_output_mw: 28600.0,
      status: "TOPOLOGICAL_SUPERGRID_SYNCHRONIZED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/majorana-supergrid-power/arrays`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_ARRAYS));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_ARRAYS);
}

