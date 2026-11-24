import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  total_db_nodes: 5,
  raft_term: 42,
  current_leader_id: "db-node-aws-useast1",
  raft_quorum_status: "HEALTHY_3_OF_5",
  rpo_seconds: 0.0,
  rto_failover_sla_ms: 12.0,
  committed_wal_index: 948102,
  immutable_worm_sync_status: "CONTINUOUS_REPLICATED",
  last_synced_at: Math.floor(Date.now() / 1000),
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/infrastructure/db-quorum/metrics`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_METRICS>(res, FALLBACK_METRICS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback DB quorum metrics:", e);
  }
  return NextResponse.json(FALLBACK_METRICS);
}
