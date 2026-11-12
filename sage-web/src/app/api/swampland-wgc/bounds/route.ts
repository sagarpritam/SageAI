import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  bounds: [
    {
      bound_id: "SWL-DISTANCE-TOWER-01",
      regime: "Asymptotic Moduli Space (Exponential KK / String Tower Descent)",
      default_field_excursion_mpl: 2.4,
      default_alpha_exponent: 0.707,
      default_charge_mass_ratio: 1.18,
      base_uv_fidelity_pct: 99.997,
      base_eft_suppression_db: 154.2,
      status: "SWAMPLAND_UV_LOCKED",
    },
    {
      bound_id: "SWL-SUBLATTICE-WGC-02",
      regime: "Sublattice Weak Gravity & Convex Hull Extremal Black-Hole Bound",
      default_field_excursion_mpl: 1.8,
      default_alpha_exponent: 0.65,
      default_charge_mass_ratio: 1.42,
      base_uv_fidelity_pct: 99.998,
      base_eft_suppression_db: 157.6,
      status: "SWAMPLAND_UV_LOCKED",
    },
    {
      bound_id: "SWL-FESTINA-LENTE-03",
      regime: "De Sitter Festina-Lente & Species Scale Lambda_sp Cutoff Mesh",
      default_field_excursion_mpl: 1.2,
      default_alpha_exponent: 0.58,
      default_charge_mass_ratio: 1.64,
      base_uv_fidelity_pct: 99.999,
      base_eft_suppression_db: 160.4,
      status: "SWAMPLAND_UV_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/swampland-wgc/bounds`,
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

