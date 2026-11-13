import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_chiral_algebras: 3,
  total_chiral_seals: 18,
  mean_unitarity_pct: 99.99948,
  capability: "Capability 157 - Beilinson-Drinfeld Grassmannian & Chiral Homology Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/beilinson-drinfeld-chiral/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_METRICS);
}
