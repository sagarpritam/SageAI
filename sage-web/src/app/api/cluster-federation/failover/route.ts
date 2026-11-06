import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const failingCluster = body.failing_cluster_id || "CLUSTER-EU-CENTRAL-02";
    const backupCluster = body.backup_cluster_id || "CLUSTER-US-EAST-01";
    const reason = body.reason || "SIMULATED_REGIONAL_EMP_ISOLATION";

    return NextResponse.json({
      isolated_cluster_id: failingCluster,
      active_failover_cluster_id: backupCluster,
      failover_latency_ms: 7.42,
      traffic_reroute_status: "100%_TRAFFIC_DEFLECTED_TO_BACKUP",
      state_loss_pct: 0.0,
      merkle_verification: "CONSISTENT_ACROSS_QUORUM",
      reason: reason,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
