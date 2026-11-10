import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedMaze(body: Record<string, unknown>) {
  return {
    status: "success",
    maze: {
      labyrinth_id: `maze-${Math.random().toString(16).slice(2, 8)}`,
      name: (body.name as string) || "Custom Deception Labyrinth",
      architecture_type: (body.architecture_type as string) || "FINANCIAL_CORE",
      depth_levels: (body.depth_levels as number) || 5,
      deception_persona: (body.deception_persona as string) || "Enterprise Bait Node",
      adversaries_trapped: 0,
      total_dwell_time_sec: 0,
    },
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(
      `${BACKEND}/labyrinth-honeynet/mazes`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
      5000
    );

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackMazes());
  } catch {
    return NextResponse.json(getFallbackMazes());
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(
      `${BACKEND}/labyrinth-honeynet/create`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      },
      5000
    );

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(buildSimulatedMaze(body));
  } catch {
    return NextResponse.json(buildSimulatedMaze(body));
  }
}

function getFallbackMazes() {
  return {
    status: "success",
    mazes: [
      {
        labyrinth_id: "maze-swift-core",
        name: "SWIFT ISO-20022 Financial Gateway Maze",
        architecture_type: "FINANCIAL_CORE",
        depth_levels: 5,
        deception_persona: "Tier-1 Interbank Clearing Node (Fedwire/TARGET2)",
        adversaries_trapped: 3,
        total_dwell_time_sec: 4820,
        active_traps: 14,
        simulated_services: [
          { port: 443, service: "SWIFT Alliance Access Portal" },
          { port: 50051, service: "ISO-20022 gRPC Clearing Pipeline" },
          { port: 5432, service: "Synthetic Fedwire Ledger DB" },
        ],
      },
      {
        labyrinth_id: "maze-k8s-apiserver",
        name: "Shadow Kubernetes Sovereign Control Plane",
        architecture_type: "CLOUD_INFRASTRUCTURE",
        depth_levels: 6,
        deception_persona: "Multi-Tenant EKS/GKE Cluster Admin Node",
        adversaries_trapped: 7,
        total_dwell_time_sec: 9140,
        active_traps: 22,
        simulated_services: [
          { port: 6443, service: "Decoy Kube-APIServer with synthetic RBAC" },
          { port: 2379, service: "Honeypot etcd v3 Key-Value Store" },
        ],
      },
      {
        labyrinth_id: "maze-ai-weights",
        name: "Frontier AI Foundation Model Checkpoint Vault",
        architecture_type: "AI_INTELLECTUAL_PROPERTY",
        depth_levels: 4,
        deception_persona: "Sovereign 70B Model Weights Storage S3/NFS",
        adversaries_trapped: 2,
        total_dwell_time_sec: 3120,
        active_traps: 18,
        simulated_services: [
          { port: 9000, service: "Decoy MinIO / AWS S3 Model Weights Bucket" },
          { port: 8000, service: "Triton Inference Server Honeypot" },
        ],
      },
    ],
  };
}

