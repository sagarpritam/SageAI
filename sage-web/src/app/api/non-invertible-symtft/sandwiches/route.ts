import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  sandwiches: [
    {
      sandwich_id: "SYMTFT-KW-ISING-01",
      fusion_category: "Tambara-Yamagami TY(Z_2) Kramers-Wannier Duality Bulk Z(Vec_{Z_2})",
      quantum_dimension_duality: 1.41421,
      default_higher_form_p: 1,
      default_anyon_objects: 4,
      base_defect_fidelity_pct: 99.997,
      base_anomaly_isolation_db: 154.6,
      status: "SYMTFT_BULK_COHERENT",
    },
    {
      sandwich_id: "SYMTFT-REPD8-TRIALITY-02",
      fusion_category: "Rep(D_8) Non-Invertible Gauge-Triality 4D SymTFT Sandwich",
      quantum_dimension_duality: 2.0,
      default_higher_form_p: 1,
      default_anyon_objects: 8,
      base_defect_fidelity_pct: 99.998,
      base_anomaly_isolation_db: 157.9,
      status: "SYMTFT_BULK_COHERENT",
    },
    {
      sandwich_id: "SYMTFT-TY-SU2K4-03",
      fusion_category: "Drinfeld Center Z(SU(2)_4) Condensed Lagrangian Algebra Lattice",
      quantum_dimension_duality: 2.23607,
      default_higher_form_p: 2,
      default_anyon_objects: 12,
      base_defect_fidelity_pct: 99.999,
      base_anomaly_isolation_db: 160.2,
      status: "SYMTFT_BULK_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/non-invertible-symtft/sandwiches`,
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

