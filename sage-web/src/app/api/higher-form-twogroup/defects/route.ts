import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  defects: [
    {
      defect_id: "TWOGROUP-POSTNIKOV-H3-01",
      algebra: "2-Group (SU(N), U(1)^1) Postnikov H^3(BG, U(1)) Class Bundle",
      default_postnikov_order: 4,
      default_walker_wang_rank: 8,
      default_inflow_coupling: 1.2,
      base_unitarity_pct: 99.997,
      base_suppression_db: 158.9,
      status: "TWOGROUP_ARMED",
    },
    {
      defect_id: "TWOGROUP-WALKER-WANG-02",
      algebra: "3+1D Walker-Wang Pre-Modular Ribbon Category Surface Code",
      default_postnikov_order: 6,
      default_walker_wang_rank: 12,
      default_inflow_coupling: 1.45,
      base_unitarity_pct: 99.998,
      base_suppression_db: 161.4,
      status: "TWOGROUP_ARMED",
    },
    {
      defect_id: "TWOGROUP-GREENSCHWARZ-03",
      algebra: "10D/4D Green-Schwarz 2-Form B_2 Bianchi Identity Compensator",
      default_postnikov_order: 8,
      default_walker_wang_rank: 16,
      default_inflow_coupling: 1.75,
      base_unitarity_pct: 99.999,
      base_suppression_db: 164.0,
      status: "TWOGROUP_ARMED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/higher-form-twogroup/defects`,
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

