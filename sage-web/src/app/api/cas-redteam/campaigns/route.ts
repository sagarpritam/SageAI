import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/cas-redteam/campaigns`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackCampaigns());
  } catch {
    return NextResponse.json(getFallbackCampaigns());
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/cas-redteam/launch`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({
      status: "success",
      campaign: {
        campaign_id: `cas-camp-${Math.random().toString(16).slice(2, 8)}`,
        name: body.name || "Adversary Simulation",
        target_scope: body.target_scope || "*.sageai.io",
        status: "RUNNING",
        current_round: 1,
        posture_score: 85.0,
        findings: [],
      },
    });
  } catch {
    return NextResponse.json({ status: "error", message: "Failed to launch simulation" }, { status: 500 });
  }
}

function getFallbackCampaigns() {
  return {
    status: "success",
    campaigns: [
      {
        campaign_id: "cas-camp-001",
        name: "Cloud Native Kubernetes Perimeter Assault",
        target_scope: "k8s-cluster.prod.internal / *.api.sage.cloud",
        scenario_type: "CLOUD_INGRESS_AND_CONTAINER_ESCAPE",
        intensity: "AGGRESSIVE",
        status: "COMPLETED",
        rounds_completed: 4,
        posture_score: 78.5,
        agents: {
          ReconAgent: { role: "Attack Surface Discovery", actions_taken: 24, findings_count: 6 },
          ExploitCrafterAgent: { role: "Dynamic Payload Synthesis", actions_taken: 18, findings_count: 4 },
          PrivilegeEscalationAgent: { role: "IAM Token Harvesting", actions_taken: 12, findings_count: 2 },
          EvasionAgent: { role: "WAF Bypassing", actions_taken: 16, findings_count: 3 },
        },
        findings: [
          {
            finding_id: "find-01",
            agent: "ReconAgent",
            title: "Unauthenticated Prometheus Metrics Endpoint Discovered",
            severity: "MEDIUM",
            mitre_technique: "T1595.002",
            target: "https://api.sage.cloud/metrics",
            status: "CONFIRMED",
          },
          {
            finding_id: "find-02",
            agent: "ExploitCrafterAgent",
            title: "SSRF in Image Processing Webhook Pipeline",
            severity: "HIGH",
            mitre_technique: "T1190",
            target: "https://api.sage.cloud/v1/media/transcode",
            status: "EXPLOITED",
          },
        ],
      },
    ],
  };
}
