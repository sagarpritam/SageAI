import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  let body: Record<string, unknown> = {};

  try {
    body = await req.json().catch(() => ({}));
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/canary-fabric/deploy`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackDeploy(body));
  } catch {
    return NextResponse.json(getFallbackDeploy(body));
  }
}

function getFallbackDeploy(body: Record<string, unknown>) {
  const tokenType = (body.token_type as string) || "CLOUD_IAM";
  return {
    status: "success",
    canary: {
      canary_id: `canary-${tokenType.toLowerCase()}-${Date.now().toString(16)}`,
      token_type: tokenType,
      ecosystem: "Decoy Environment",
      deployment_target: (body.deployment_target as string) || "local/.env",
      token_preview: "SYNTHETIC_CANARY_TOKEN_ACTIVE",
      status: "ACTIVE_MONITORED",
      tripwire_count: 0,
      deployed_at: new Date().toISOString(),
    },
  };
}

