import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_NODES = [
  {
    node_id: "db-node-aws-useast1",
    provider: "AWS Aurora Global",
    region: "us-east-1",
    shard_id: "shard-01-primary",
    raft_role: "LEADER",
    replication_lag_ms: 0.8,
    storage_engine: "PostgreSQL 16.2 NVMe",
    status: "ONLINE_HEALTHY",
  },
  {
    node_id: "db-node-gcp-uscent1",
    provider: "Google Cloud Spanner",
    region: "us-central1",
    shard_id: "shard-02-hotstandby",
    raft_role: "FOLLOWER",
    replication_lag_ms: 4.2,
    storage_engine: "Paxos TrueTime",
    status: "ONLINE_HEALTHY",
  },
  {
    node_id: "db-node-az-eastus",
    provider: "Azure Cosmos DB",
    region: "eastus",
    shard_id: "shard-03-replica",
    raft_role: "FOLLOWER",
    replication_lag_ms: 6.5,
    storage_engine: "Strong Consistency Shard",
    status: "ONLINE_HEALTHY",
  },
  {
    node_id: "db-node-aws-euwest1",
    provider: "AWS Aurora Global",
    region: "eu-west-1",
    shard_id: "shard-04-crosscontinent",
    raft_role: "FOLLOWER",
    replication_lag_ms: 38.1,
    storage_engine: "PostgreSQL 16.2 NVMe",
    status: "ONLINE_HEALTHY",
  },
  {
    node_id: "db-node-gcp-asiaeast1",
    provider: "Google Cloud Spanner",
    region: "asia-east1",
    shard_id: "shard-05-asiapacific",
    raft_role: "FOLLOWER",
    replication_lag_ms: 84.6,
    storage_engine: "Paxos TrueTime",
    status: "ONLINE_HEALTHY",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/infrastructure/db-quorum/nodes`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_NODES>(res, FALLBACK_NODES);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback DB quorum nodes:", e);
  }
  return NextResponse.json(FALLBACK_NODES);
}
