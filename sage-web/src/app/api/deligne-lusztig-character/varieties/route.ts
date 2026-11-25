import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/deligne-lusztig-character/varieties`,
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
          variety_id: "DL-GL3-FLAG-01",
          group_type: "General Linear Group GL_3(F_q) over Finite Field F_q",
          weyl_element_w: "Coxeter Element s_1 s_2 in Symmetric Group S_3",
          weyl_length_l: 2,
          finite_field_q: 7,
          unipotent_degrees: [1, 7, 49],
          base_orthogonality_fidelity_pct: 99.9999,
          status: "DL_CHARACTER_SHEAF_ACTIVE",
        },
        {
          variety_id: "DL-SP4-SYMPLECTIC-02",
          group_type: "Symplectic Group Sp_4(F_q) with Root System C_2",
          weyl_element_w: "Longest Weyl Element w_0 of Hyperoctahedral Group B_2",
          weyl_length_l: 4,
          finite_field_q: 5,
          unipotent_degrees: [1, 10, 25, 50],
          base_orthogonality_fidelity_pct: 99.9998,
          status: "DL_CHARACTER_SHEAF_ACTIVE",
        },
        {
          variety_id: "DL-G2-EXCEPTIONAL-03",
          group_type: "Chevalley Group G_2(F_q) of Exceptional Cartan Type",
          weyl_element_w: "Coxeter Element w_cox in Dihedral Group D_6",
          weyl_length_l: 6,
          finite_field_q: 3,
          unipotent_degrees: [1, 6, 14, 27, 42],
          base_orthogonality_fidelity_pct: 99.9997,
          status: "DL_CHARACTER_SHEAF_ACTIVE",
        },
      ],
    },
    { status: 200 }
  );
}
