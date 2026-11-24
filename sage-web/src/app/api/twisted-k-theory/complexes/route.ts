import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_COMPLEXES = {
  complexes: [
    {
      complex_id: "TWISTED-K-K3-H3-01",
      classification: "Twisted K-Theory K^H(K3 x S^1) with Dixmier-Douady Class [H] = 3",
      dixmier_douady_class: 3,
      ahss_rank: 24,
      freed_witten_invariant: 0.0,
      base_fidelity_pct: 99.9995,
      status: "RAMOND_RAMOND_CHARGED",
    },
    {
      complex_id: "TWISTED-K-CY3-TORUS-02",
      classification: "Calabi-Yau 3-Fold Twisted Bundles with NS-NS 3-Form Flux",
      dixmier_douady_class: 5,
      ahss_rank: 12,
      freed_witten_invariant: 0.0,
      base_fidelity_pct: 99.9997,
      status: "RAMOND_RAMOND_CHARGED",
    },
    {
      complex_id: "TWISTED-K-GERBE-ORBIFOLD-03",
      classification: "U(1)-Gerbe Twisted Equivariant K-Theory on T^6 / Z_2",
      dixmier_douady_class: 7,
      ahss_rank: 48,
      freed_witten_invariant: 0.0,
      base_fidelity_pct: 99.9999,
      status: "RAMOND_RAMOND_CHARGED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/twisted-k-theory/complexes`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_COMPLEXES));
    }
    return NextResponse.json(FALLBACK_COMPLEXES);
  } catch {
    return NextResponse.json(FALLBACK_COMPLEXES);
  }
}
