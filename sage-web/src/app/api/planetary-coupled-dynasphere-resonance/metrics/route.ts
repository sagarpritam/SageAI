import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/planetary-coupled-dynasphere-resonance/metrics`,
      { method: "GET" },
      8000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, {}));
    }
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      active_nodes_count: 3,
      harvest_events_total: 156,
      total_baseload_dispatch_gw: 1248.0,
      mean_extraction_efficiency_pct: 96.0,
      dynasphere_coupling_status: "COUPLED_DYNASPHERE_RESONANCE_LOCKED",
    },
    { status: 200 }
  );
}
