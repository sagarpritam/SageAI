import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  strata: [
    {
      stratum_id: "TMF-WITTEN-GENUS-01",
      spectrum: "4k-Dimensional String Manifold Witten Genus phi_W(M)",
      default_modular_weight: 12,
      default_torsion_order: 24,
      default_adams_page: 3,
      base_cohomology_fidelity_pct: 99.997,
      base_torsion_suppression_db: 154.9,
      status: "TMF_SPECTRUM_COHERENT",
    },
    {
      stratum_id: "TMF-24TORSION-HOPKINS-02",
      spectrum: "Hopkins-Miller Z/24 Modular Discriminant & 3-Sphere Homotopy Lock",
      default_modular_weight: 24,
      default_torsion_order: 24,
      default_adams_page: 5,
      base_cohomology_fidelity_pct: 99.998,
      base_torsion_suppression_db: 158.3,
      status: "TMF_SPECTRUM_COHERENT",
    },
    {
      stratum_id: "TMF-STRING-COBORDISM-03",
      spectrum: "Anderson-Brown-Peterson MString -> TMF Stolz-Teichner SQFT Mesh",
      default_modular_weight: 16,
      default_torsion_order: 12,
      default_adams_page: 4,
      base_cohomology_fidelity_pct: 99.999,
      base_torsion_suppression_db: 161.2,
      status: "TMF_SPECTRUM_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/tmf-cohomology/strata`,
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

