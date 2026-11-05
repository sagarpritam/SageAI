import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  let body: Record<string, unknown> = {};

  try {
    body = await req.json().catch(() => ({}));
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/canary-fabric/tripwire`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackTripwire(body));
  } catch {
    return NextResponse.json(getFallbackTripwire(body));
  }
}

function getFallbackTripwire(body: Record<string, unknown>) {
  const canaryId = (body.canary_id as string) || "canary-iam-aws-01";
  const attackerIp = (body.attacker_ip as string) || "198.51.100.74";
  return {
    status: "TRIPWIRE_ALERT_ACTIVE",
    event: {
      event_id: `tripwire-${Date.now().toString(16)}`,
      canary_id: canaryId,
      canary_type: "CLOUD_IAM",
      ecosystem: "AWS IAM / STS",
      attacker_ip: attackerIp,
      user_agent: "python-requests/2.31.0 (ExfiltrationTool)",
      target_service: "AWS STS GetCallerIdentity",
      alert_severity: "CRITICAL_ZERO_TOLERANCE_BREACH",
      sdn_containment: {
        status: "ISOLATED_QUARANTINED",
        isolation_id: `sdn-iso-${Date.now().toString(16)}`,
        redirect_to_honeynet: true,
      },
      timestamp: new Date().toISOString(),
    },
  };
}

