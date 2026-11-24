import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_MANIFOLDS = {
  manifolds: [
    {
      manifold_id: "APS-DIRAC-CYLINDER-01",
      boundary_type: "Riemannian Cylinder S^1 x S^2 with Dirac Boundary N",
      dimension: 4,
      base_eta_invariant: 0.166667,
      index_a_hat: 0,
      base_firewall_fidelity_pct: 99.9998,
      status: "APS_BOUNDARY_SEALED",
    },
    {
      manifold_id: "APS-LENS-SPACE-02",
      boundary_type: "Lens Space Boundary L(5, 1) = S^3 / Z_5",
      dimension: 4,
      base_eta_invariant: 0.400000,
      index_a_hat: 1,
      base_firewall_fidelity_pct: 99.9997,
      status: "APS_BOUNDARY_SEALED",
    },
    {
      manifold_id: "APS-EGUCHI-HANSON-03",
      boundary_type: "ALE Eguchi-Hanson Gravitational Instanton Boundary S^3 / Z_2",
      dimension: 4,
      base_eta_invariant: -0.250000,
      index_a_hat: 0,
      base_firewall_fidelity_pct: 99.9999,
      status: "APS_BOUNDARY_SEALED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/aps-eta-firewall/manifolds`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_MANIFOLDS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_MANIFOLDS, { status: 200 });
}
