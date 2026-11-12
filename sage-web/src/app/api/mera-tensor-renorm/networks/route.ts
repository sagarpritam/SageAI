import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  networks: [
    {
      network_id: "MERA-TERNARY-ADS3-01",
      architecture: "Ternary AdS3 Hyperbolic MERA Disentangler Lattice (chi=32)",
      default_bond_dim_chi: 32,
      default_rg_layers: 14,
      default_c_central_charge: 12.0,
      base_unitarity_pct: 99.997,
      base_suppression_db: 161.2,
      status: "MERA_CAUSAL_CONE_LOCKED",
    },
    {
      network_id: "CMERA-CONTINUOUS-UV-02",
      architecture: "Continuous cMERA Gaussian Entangler Scale Generator (chi=64)",
      default_bond_dim_chi: 64,
      default_rg_layers: 18,
      default_c_central_charge: 18.0,
      base_unitarity_pct: 99.998,
      base_suppression_db: 163.4,
      status: "MERA_CAUSAL_CONE_LOCKED",
    },
    {
      network_id: "BRANCHING-MERA-SPHERICAL-03",
      architecture: "Multi-Branching Holographic Fermi Surface MERA Network (chi=128)",
      default_bond_dim_chi: 128,
      default_rg_layers: 24,
      default_c_central_charge: 24.0,
      base_unitarity_pct: 99.999,
      base_suppression_db: 166.1,
      status: "MERA_CAUSAL_CONE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/mera-tensor-renorm/networks`,
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

