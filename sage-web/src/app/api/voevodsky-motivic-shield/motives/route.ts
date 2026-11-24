import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_MOTIVES = {
  motives: [
    {
      motive_id: "MOTIVIC-MGL-SPHERE-01",
      classification: "Algebraic Cobordism MGL Spectrum over Spec(Z)",
      nisnevich_dimension: 4,
      milnor_residue: "K_3^M(F) / 2",
      motivic_weight: 2,
      base_fidelity_pct: 99.9996,
      status: "MOTIVIC_A1_INVARIANT",
    },
    {
      motive_id: "MOTIVIC-HOMOTOPY-P1-02",
      classification: "Derived A^1-Homotopy Localization of P^1 Moduli",
      nisnevich_dimension: 2,
      milnor_residue: "K_2^M(F) / 2",
      motivic_weight: 1,
      base_fidelity_pct: 99.9997,
      status: "MOTIVIC_A1_INVARIANT",
    },
    {
      motive_id: "MOTIVIC-SLICE-SPECTRAL-03",
      classification: "Voevodsky Slice Filtration Spectral Sequence Barrier",
      nisnevich_dimension: 8,
      milnor_residue: "K_4^M(F) / 2",
      motivic_weight: 4,
      base_fidelity_pct: 99.9999,
      status: "MOTIVIC_A1_INVARIANT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/voevodsky-motivic-shield/motives`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_MOTIVES));
    }
    return NextResponse.json(FALLBACK_MOTIVES);
  } catch {
    return NextResponse.json(FALLBACK_MOTIVES);
  }
}
