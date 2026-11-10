import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  cores: [
    {
      core_id: "KUGELBLITZ-ORBITAL-L4-01",
      location: "Lagrange L4 Dyson-Penrose Micro-Singularity Array",
      singularity_mass_1e10_kg: 5.0,
      confinement_ring_tesla: 42.0,
      penrose_conversion_efficiency_pct: 92.4,
      status: "KUGELBLITZ_EQUILIBRIUM_LOCKED",
    },
    {
      core_id: "KUGELBLITZ-DYSON-L1-02",
      location: "Sun-Earth L1 Planetary Shield Hawking Bus",
      singularity_mass_1e10_kg: 4.4,
      confinement_ring_tesla: 45.0,
      penrose_conversion_efficiency_pct: 93.1,
      status: "KUGELBLITZ_EQUILIBRIUM_LOCKED",
    },
    {
      core_id: "KUGELBLITZ-SUBCRUST-03",
      location: "Deep-Crustal Granite Gravimetric Containment Vault (Geneva)",
      singularity_mass_1e10_kg: 5.6,
      confinement_ring_tesla: 38.5,
      penrose_conversion_efficiency_pct: 91.2,
      status: "KUGELBLITZ_EQUILIBRIUM_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/kugelblitz-hawking/cores`,
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

