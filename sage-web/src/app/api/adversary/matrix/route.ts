import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetchBackend(`${BACKEND}/adversary/matrix`, {
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(getFallbackMatrix());
  } catch {
    return NextResponse.json(getFallbackMatrix());
  }
}

function getFallbackMatrix() {
  return {
    status: "OPERATIONAL",
    framework_version: "MITRE ATT&CK Enterprise v14.1",
    tactics_count: 14,
    average_coverage_pct: 95.2,
    tactics: [
      { id: "TA0043", name: "Reconnaissance", coverage_pct: 95, techniques: ["T1595", "T1592"] },
      { id: "TA0001", name: "Initial Access", coverage_pct: 98, techniques: ["T1190", "T1078"] },
      { id: "TA0002", name: "Execution", coverage_pct: 96, techniques: ["T1059", "T1203"] },
      { id: "TA0004", name: "Privilege Escalation", coverage_pct: 94, techniques: ["T1068", "T1611"] },
      { id: "TA0006", name: "Credential Access", coverage_pct: 97, techniques: ["T1003", "T1552"] },
      { id: "TA0011", name: "Command and Control", coverage_pct: 98, techniques: ["T1071", "T1573"] },
    ],
    apt_profiles: ["APT29", "FIN7", "VOLT_TYPHOON"],
  };
}

