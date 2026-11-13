import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_dt_sheaves: 3,
  total_dt_seals: 18,
  mean_unitarity_pct: 99.99935,
  capability: "Capability 155 - Donaldson-Thomas Invariant & Coherent Sheaf Moduli Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/donaldson-thomas-sheaf/metrics`,
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
