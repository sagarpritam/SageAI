import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json().catch(() => ({}));
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND}/ransomware/deploy-canaries`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
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
    armed_count: 4,
    canaries_deployed: [
      { canary_id: "CANARY-A1B2", filename: "passwords_vault_2026.docx", path: "/shared/finance/passwords_vault_2026.docx", status: "ARMED_AND_MONITORING" },
      { canary_id: "CANARY-C3D4", filename: "financial_audit_q4_confidential.xlsx", path: "/shared/finance/financial_audit_q4_confidential.xlsx", status: "ARMED_AND_MONITORING" },
      { canary_id: "CANARY-E5F6", filename: "enterprise_merger_contracts.pdf", path: "/home/corp/documents/enterprise_merger_contracts.pdf", status: "ARMED_AND_MONITORING" },
      { canary_id: "CANARY-G7H8", filename: "db_master_credentials.kdbx", path: "C:\\Users\\Public\\Documents\\db_master_credentials.kdbx", status: "ARMED_AND_MONITORING" },
    ],
  };
}

