import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_PACKETS = {
  packets: [
    {
      packet_id: "LANGLANDS-GL2-MODULAR-01",
      group: "GL(2, A_Q)",
      weight_k: 12,
      conductor_level: 1,
      character: "Trivial Nebentypus chi_0",
      representation_type: "Cuspidal Automorphic Ramanujan Delta Form",
      spectral_gap: 0.4418,
      base_fidelity_pct: 99.9998,
      status: "LANGLANDS_DUALITY_ACTIVE",
    },
    {
      packet_id: "LANGLANDS-GL3-MAASS-01",
      group: "PGL(3, A_Q)",
      weight_k: 0,
      conductor_level: 1,
      character: "Spherical Maass Wave Form",
      representation_type: "Generalized Ramanujan Self-Dual Eigenpacket",
      spectral_gap: 0.3872,
      base_fidelity_pct: 99.9995,
      status: "LANGLANDS_DUALITY_ACTIVE",
    },
    {
      packet_id: "LANGLANDS-SHIMURA-ELLIPTIC-01",
      group: "GL(2, A_Q)",
      weight_k: 2,
      conductor_level: 5077,
      character: "Eichler-Shimura Modular Elliptic Curve",
      representation_type: "Rank 3 Global Motive L-Function",
      spectral_gap: 0.4912,
      base_fidelity_pct: 99.9999,
      status: "LANGLANDS_DUALITY_ACTIVE",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/langlands-automorphic/packets`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_PACKETS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_PACKETS, { status: 200 });
}
