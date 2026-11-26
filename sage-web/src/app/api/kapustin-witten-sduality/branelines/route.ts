import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/kapustin-witten-sduality/branelines`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Kapustin-Witten branelines:", err);
    return NextResponse.json({
      branelines: [
        {
          braneline_id: "KAPUSTIN-WITTEN-SDUAL-01",
          gauge_group: "PSU(N) <-> SU(N)",
          twist_parameter_t: 1.0,
          hecke_eigenvalue_rank: 3,
          s_duality_defect: 0.0,
          kw_shield_strength_pev: 4.16e12,
          s_duality_suppression_db: 212.5,
          brane_state: "KAPUSTIN_WITTEN_SDUAL_LOCKED",
        },
        {
          braneline_id: "KAPUSTIN-WITTEN-AB-02",
          gauge_group: "SO(2n+1) <-> Sp(2n)",
          twist_parameter_t: 0.0,
          hecke_eigenvalue_rank: 4,
          s_duality_defect: 0.0,
          kw_shield_strength_pev: 4.3e12,
          s_duality_suppression_db: 213.35,
          brane_state: "KAPUSTIN_WITTEN_SDUAL_LOCKED",
        },
        {
          braneline_id: "KAPUSTIN-WITTEN-E8-03",
          gauge_group: "E_8 <-> ^L E_8",
          twist_parameter_t: 1.0,
          hecke_eigenvalue_rank: 8,
          s_duality_defect: 0.0,
          kw_shield_strength_pev: 4.44e12,
          s_duality_suppression_db: 214.2,
          brane_state: "KAPUSTIN_WITTEN_SDUAL_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
