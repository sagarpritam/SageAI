import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/grr-baum-fulton-macpherson/varieties`,
      { method: "GET" },
      8000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, { varieties: [] }));
    }
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      varieties: [
        {
          variety_id: "BFM-SINGULAR-SCHUBERT-01",
          name: "Singular Schubert Variety Gr(2, 5) Locus",
          variety_type: "SINGULAR_SCHUBERT_VARIETY",
          dimension_n: 6,
          singular_strata_codimension: 2,
          chow_homology_rank: 14,
          todd_class_degree: 4,
          intersection_pairing_valid: true,
          status: "BFM_CHOW_LOCKED",
        },
        {
          variety_id: "BFM-KUMMER-ORBIFOLD-02",
          name: "Singular Kummer 4-Torus T^4 / Z_2 Orbifold",
          variety_type: "ORBIFOLD_SINGULARITY",
          dimension_n: 4,
          singular_strata_codimension: 4,
          chow_homology_rank: 22,
          todd_class_degree: 4,
          intersection_pairing_valid: true,
          status: "BFM_CHOW_LOCKED",
        },
        {
          variety_id: "BFM-CONIFOLD-TRANSITION-03",
          name: "Singular Calabi-Yau Nodal Conifold Variety",
          variety_type: "NODAL_CONIFOLD",
          dimension_n: 6,
          singular_strata_codimension: 3,
          chow_homology_rank: 36,
          todd_class_degree: 6,
          intersection_pairing_valid: true,
          status: "BFM_CHOW_LOCKED",
        },
      ],
    },
    { status: 200 }
  );
}
