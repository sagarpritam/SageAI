import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  operads: [
    {
      operad_id: "OPERAD-KOSZUL-LINF-01",
      classification: "Koszul Quadratic L_infinity Operadic Bar-Cobar Adjunction",
      default_arity: 4,
      default_graph_loops: 12,
      default_transfer_order: 10,
      base_unitarity_pct: 99.9983,
      base_suppression_db: 164.6,
      status: "OPERAD_KOSZUL_LOCKED",
    },
    {
      operad_id: "KONTSEVICH-FORMALITY-POISSON-02",
      classification: "Kontsevich Graph-Complex Formality & Poisson Quantization Operad",
      default_arity: 6,
      default_graph_loops: 18,
      default_transfer_order: 14,
      base_unitarity_pct: 99.9991,
      base_suppression_db: 166.5,
      status: "OPERAD_KOSZUL_LOCKED",
    },
    {
      operad_id: "BAR-COBAR-EN-BV-03",
      classification: "Getzler-Jones Framed Little-Disk BV Homotopy Transfer Operad",
      default_arity: 8,
      default_graph_loops: 24,
      default_transfer_order: 18,
      base_unitarity_pct: 99.9996,
      base_suppression_db: 168.8,
      status: "OPERAD_KOSZUL_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/operadic-bv-bar-cobar/operads`,
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

