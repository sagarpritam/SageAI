import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  universes: [
    {
      universe_id: "HOTT-UNIVALENCE-U0-01",
      classification: "Voevodsky Univalent Type Universe U_0 & Kan-Cubical Path Firewall",
      default_truncation_level: 2,
      default_cubical_dim: 8,
      default_hit_constructors: 10,
      base_fidelity_pct: 99.9981,
      base_suppression_db: 164.0,
      status: "HOTT_UNIVALENCE_LOCKED",
    },
    {
      universe_id: "CUBICAL-ECKMANN-H2-02",
      classification: "Eckmann-Hilton 2-Groupoid Higher Inductive Type Boundary",
      default_truncation_level: 3,
      default_cubical_dim: 12,
      default_hit_constructors: 14,
      base_fidelity_pct: 99.9988,
      base_suppression_db: 165.8,
      status: "HOTT_UNIVALENCE_LOCKED",
    },
    {
      universe_id: "KAN-INFINITY-OMEGA-03",
      classification: "Simplicial Infinity-Groupoid Kan Fibration Transport Matrix",
      default_truncation_level: 4,
      default_cubical_dim: 16,
      default_hit_constructors: 20,
      base_fidelity_pct: 99.9995,
      base_suppression_db: 167.8,
      status: "HOTT_UNIVALENCE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/homotopy-type-univalence/universes`,
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

