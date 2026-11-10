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

    const res = await fetchBackend(`${BACKEND}/cti/taxii/collections`, {
      method: "GET",
      headers,
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(getFallbackTaxii());
  } catch {
    return NextResponse.json(getFallbackTaxii());
  }
}

function getFallbackTaxii() {
  return {
    title: "SageAI Sovereign CTI TAXII 2.1 Server",
    description: "High-confidence decentralized threat intelligence and CISA KEV real-time streams.",
    contact: "cti-ops@sageai.internal",
    collections: [
      { id: "col-cisa-kev", title: "CISA Known Exploited Vulnerabilities (KEV)", can_read: true, can_write: false },
      { id: "col-sageai-honeypot-mesh", title: "SageAI Honeypot & Deception Tripwire IOCs", can_read: true, can_write: true },
      { id: "col-apt-campaigns", title: "Global APT Threat Campaigns 2026", can_read: true, can_write: false },
    ],
  };
}

