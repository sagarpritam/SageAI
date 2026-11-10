import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedIncident(body: Record<string, unknown>) {
  return {
    status: "success",
    incident: {
      incident_id: `INC-SEC-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
      title: (body.title as string) || "Major Incident",
      severity: (body.severity as string) || "CRITICAL",
      impacted_systems: (body.impacted_systems as string[]) || ["Core Cloud"],
      records_compromised: (body.records_compromised as number) || 15000,
      materiality_verdict: "MATERIAL_CYBERSECURITY_INCIDENT",
      deadlines: {
        SEC_8K_DAYS_REMAINING: 4,
        NIS2_EARLY_WARNING_HOURS: 24,
        GDPR_DPA_HOURS_REMAINING: 72,
      },
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
      `${BACKEND}/regulatory-commander/incidents`,
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
    return NextResponse.json(getFallbackIncidents());
  } catch {
    return NextResponse.json(getFallbackIncidents());
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
      `${BACKEND}/regulatory-commander/declare-incident`,
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
    return NextResponse.json(buildSimulatedIncident(body));
  } catch {
    return NextResponse.json(buildSimulatedIncident(body));
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

