import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  tessellations: [
    {
      tessellation_id: "HAPPY-PENTAGON-5-4-01",
      sector: "Hyperbolic H^2 {5,4} Perfect Pentagon Core (Geneva QEC)",
      schlafli_symbol: "{5,4}",
      perfect_tensor_code: "[[5,1,3]]",
      hyperbolic_layers: 5,
      boundary_qubits: 320,
      base_logical_fidelity_pct: 99.994,
      erasure_threshold_pct: 48.5,
      status: "ENTANGLEMENT_WEDGE_LOCKED",
    },
    {
      tessellation_id: "HAPPY-HEXAGON-6-4-02",
      sector: "Bulk-Boundary {6,4} Isometric Tensor Lattice (Cis-Lunar)",
      schlafli_symbol: "{6,4}",
      perfect_tensor_code: "[[6,0,4]] / [[5,1,3]]",
      hyperbolic_layers: 6,
      boundary_qubits: 512,
      base_logical_fidelity_pct: 99.996,
      erasure_threshold_pct: 49.2,
      status: "ENTANGLEMENT_WEDGE_LOCKED",
    },
    {
      tessellation_id: "HAPPY-MAJORANA-QEC-03",
      sector: "Majorana Fermionic Holographic Wedge Mesh (Lagrange L1)",
      schlafli_symbol: "{5,4}-Majorana",
      perfect_tensor_code: "[[8,1,3]]",
      hyperbolic_layers: 7,
      boundary_qubits: 640,
      base_logical_fidelity_pct: 99.998,
      erasure_threshold_pct: 49.6,
      status: "ENTANGLEMENT_WEDGE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/happy-holographic-qec/tessellations`,
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

