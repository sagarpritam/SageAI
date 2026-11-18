import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_BRAIDS = {
  braids: [
    {
      braid_id: "ANYON-FIB-4STRAND-01",
      classification: "4-Strand Fibonacci Anyon Topological Qubit Enclave",
      num_anyons: 4,
      fusion_space_dim: 2,
      quantum_dimension: 1.618034,
      base_fidelity_pct: 99.9992,
      topological_gap_mev: 2.45,
      status: "BRAID_SYSTEM_STABILIZED",
    },
    {
      braid_id: "ANYON-FIB-6STRAND-02",
      classification: "6-Strand Dense Fibonacci Braiding Fabric (Universal Quantum Gate)",
      num_anyons: 6,
      fusion_space_dim: 5,
      quantum_dimension: 1.618034,
      base_fidelity_pct: 99.9997,
      topological_gap_mev: 3.12,
      status: "BRAID_SYSTEM_STABILIZED",
    },
    {
      braid_id: "ANYON-FIB-8STRAND-03",
      classification: "8-Strand Distributed Macro-Topological Mesh Shield",
      num_anyons: 8,
      fusion_space_dim: 13,
      quantum_dimension: 1.618034,
      base_fidelity_pct: 99.9999,
      topological_gap_mev: 3.88,
      status: "BRAID_SYSTEM_STABILIZED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/fibonacci-anyon-braiding/braids`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_BRAIDS));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_BRAIDS);
}

