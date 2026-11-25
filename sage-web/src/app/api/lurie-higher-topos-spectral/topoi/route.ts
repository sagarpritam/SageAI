import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/lurie-higher-topos-spectral/topoi`,
      { method: "GET" },
      8000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, { topoi: [] }));
    }
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      topoi: [
        {
          topos_id: "LURIE-SPECTRAL-SCHEME-01",
          name: "Derived Spectral Scheme E_infinity-Topos",
          category_type: "SPECTRAL_ALGEBRAIC_GEOMETRY",
          homotopy_dimension: 6,
          truncation_postnikov: 8,
          hypercomplete: true,
          base_ring_spectrum: "SPHERE_SPECTRUM_S",
          sheaf_cohomology_coherence_pct: 99.9998,
          status: "SPECTRAL_DESCENT_STABLE",
        },
        {
          topos_id: "LURIE-E-INFINITY-STACK-02",
          name: "Derived Moduli Stack of Elliptic Curves",
          category_type: "DERIVED_ALGEBRAIC_STACK",
          homotopy_dimension: 4,
          truncation_postnikov: 6,
          hypercomplete: true,
          base_ring_spectrum: "TMF_ELLIPTIC_SPECTRUM",
          sheaf_cohomology_coherence_pct: 99.9995,
          status: "SPECTRAL_DESCENT_STABLE",
        },
        {
          topos_id: "LURIE-HYPERCOMPLETE-03",
          name: "Hypercomplete Higher Sheaf Topos",
          category_type: "INFINITY_TOPOS",
          homotopy_dimension: 8,
          truncation_postnikov: 12,
          hypercomplete: true,
          base_ring_spectrum: "MORAVA_K_THEORY_K2",
          sheaf_cohomology_coherence_pct: 99.9999,
          status: "SPECTRAL_DESCENT_STABLE",
        },
      ],
    },
    { status: 200 }
  );
}
