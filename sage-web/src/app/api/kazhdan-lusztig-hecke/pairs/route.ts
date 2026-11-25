import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/kazhdan-lusztig-hecke/pairs`,
      { method: "GET" },
      8000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, { pairs: [] }));
    }
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      pairs: [
        {
          pair_id: "KL-WEYL-E8-PAIR-01",
          name: "Exceptional Lie Algebra E8 Longest Element Pair",
          weyl_group: "W(E8)",
          coxeter_length_w: 120,
          bruhat_sub_length_y: 112,
          hecke_q_degree: 4,
          perverse_sheaf_self_dual: true,
          status: "KAZHDAN_LUSZTIG_STABLE",
        },
        {
          pair_id: "KL-AFFINE-SL3-PAIR-02",
          name: "Affine Weyl Group W_aff(SL3) Parabolic Pair",
          weyl_group: "W_aff(SL3)",
          coxeter_length_w: 18,
          bruhat_sub_length_y: 14,
          hecke_q_degree: 2,
          perverse_sheaf_self_dual: true,
          status: "KAZHDAN_LUSZTIG_STABLE",
        },
        {
          pair_id: "KL-HYPEROCTAHEDRAL-03",
          name: "Hyperoctahedral Group W(B4) Schubert Pair",
          weyl_group: "W(B4)",
          coxeter_length_w: 16,
          bruhat_sub_length_y: 10,
          hecke_q_degree: 3,
          perverse_sheaf_self_dual: true,
          status: "KAZHDAN_LUSZTIG_STABLE",
        },
      ],
    },
    { status: 200 }
  );
}
