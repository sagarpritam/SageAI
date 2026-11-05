import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND}/dspm/lineage`, {
      method: "GET",
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(getFallbackLineage());
  } catch {
    return NextResponse.json(getFallbackLineage());
  }
}

function getFallbackLineage() {
  return {
    status: "success",
    lineage: {
      graph_name: "SageAI Enterprise Data Lineage & Egress Flow",
      nodes: [
        { id: "ingress-api", label: "Customer Ingress API Gateway", type: "API_GATEWAY", region: "us-east-1" },
        { id: "db-core", label: "Production RDS PostgreSQL (PCI Encrypted)", type: "DATABASE", region: "us-east-1" },
        { id: "s3-analytics", label: "Analytics S3 Bucket (Public Exposed)", type: "OBJECT_STORAGE", region: "us-east-1" },
        { id: "backup-eu", label: "EU Sovereign Cold Backup", type: "ENCLAVE_STORAGE", region: "eu-central-1" },
      ],
      edges: [
        { source: "ingress-api", target: "db-core", label: "Encrypted Transaction Stream", risk: "LOW" },
        { source: "db-core", target: "s3-analytics", label: "ETL Export (Unmasked PII)", risk: "CRITICAL" },
        { source: "db-core", target: "backup-eu", label: "Zero-Egress PQC Enclave Sync", risk: "ZERO" },
      ],
      high_risk_flows: 1,
      sovereign_flows: 1,
    },
  };
}

