import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/canary-fabric/tokens`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackCanaries());
  } catch {
    return NextResponse.json(getFallbackCanaries());
  }
}

function getFallbackCanaries() {
  return {
    status: "success",
    canaries: [
      {
        canary_id: "canary-iam-aws-01",
        token_type: "CLOUD_IAM",
        ecosystem: "AWS IAM / STS",
        deployment_target: "s3://corp-financial-backups/.aws/credentials",
        token_preview: "ASIA3Z9XF...88219",
        status: "ACTIVE_MONITORED",
        tripwire_count: 0,
        deployed_at: new Date().toISOString(),
      },
      {
        canary_id: "canary-git-token-02",
        token_type: "GIT_REPO_SECRET",
        ecosystem: "GitHub Enterprise",
        deployment_target: "repo: backend-core/.env.production",
        token_preview: "ghp_live_decoy_9a8fbc71e2...",
        status: "ACTIVE_MONITORED",
        tripwire_count: 0,
        deployed_at: new Date().toISOString(),
      },
    ],
  };
}

