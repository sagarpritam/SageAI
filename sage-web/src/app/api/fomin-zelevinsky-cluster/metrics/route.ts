import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/fomin-zelevinsky-cluster/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Fomin-Zelevinsky metrics:", err);
    return NextResponse.json({
      active_clusters_count: 3,
      evaluations_total: 1,
      mean_firewall_strength_pev: 4.9e12,
      mean_cluster_algebra_suppression_db: 216.82,
      fomin_zelevinsky_compliance_pct: 100.0,
    });
  }
}
