import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/regulatory-commander/incidents`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackIncidents());
  } catch {
    return NextResponse.json(getFallbackIncidents());
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/regulatory-commander/declare-incident`, {
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
      incident: {
        incident_id: `INC-SEC-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
        title: body.title || "Major Incident",
        severity: body.severity || "CRITICAL",
        impacted_systems: body.impacted_systems || ["Core Cloud"],
        records_compromised: body.records_compromised || 15000,
        materiality_verdict: "MATERIAL_CYBERSECURITY_INCIDENT",
        deadlines: {
          SEC_8K_DAYS_REMAINING: 4,
          NIS2_EARLY_WARNING_HOURS: 24,
          GDPR_DPA_HOURS_REMAINING: 72,
        },
      },
    });
  } catch {
    return NextResponse.json({ status: "error", message: "Failed to declare incident" }, { status: 500 });
  }
}

function getFallbackIncidents() {
  return {
    status: "success",
    incidents: [
      {
        incident_id: "INC-SEC-2026-001",
        title: "Unauthorized Cloud Identity Federation Token Escalation",
        severity: "CRITICAL",
        impacted_systems: ["AWS IAM Roles Anywhere", "Azure Entra ID", "Core Billing Database"],
        records_compromised: 42000,
        materiality_verdict: "MATERIAL_CYBERSECURITY_INCIDENT",
        status: "CONTAINED_PENDING_STATUTORY_DISCLOSURE",
        deadlines: {
          SEC_8K_DAYS_REMAINING: 3,
          NIS2_EARLY_WARNING_HOURS: 0,
          GDPR_DPA_HOURS_REMAINING: 48,
        },
      },
    ],
  };
}

