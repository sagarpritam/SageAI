import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  interfaces: [
    {
      interface_id: "BCFT-CARDY-ISING-01",
      boundary_system: "Minimal Model Cardy-Ishibashi Boundary Manifold (c=1/2 -> Free/Fixed)",
      default_g_uv: 1.414,
      default_g_ir: 1.0,
      default_transmission_coeff: 0.94,
      base_unitarity_pct: 99.997,
      base_isolation_db: 159.1,
      status: "BCFT_DEFECT_SEALED",
    },
    {
      interface_id: "KONDO-RG-SCREENING-02",
      boundary_system: "SU(2)_k Overscreened Kondo Impurity RG Flow (Affleck-Ludwig g-Theorem)",
      default_g_uv: 2.0,
      default_g_ir: 1.414,
      default_transmission_coeff: 0.96,
      base_unitarity_pct: 99.998,
      base_isolation_db: 161.5,
      status: "BCFT_DEFECT_SEALED",
    },
    {
      interface_id: "JANUS-ADS-BCFT-03",
      boundary_system: "AdS5/BCFT4 Karch-Randall End-of-the-World Janus Defect",
      default_g_uv: 3.162,
      default_g_ir: 1.732,
      default_transmission_coeff: 0.98,
      base_unitarity_pct: 99.999,
      base_isolation_db: 164.2,
      status: "BCFT_DEFECT_SEALED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/cft-defect-bcft/interfaces`,
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

