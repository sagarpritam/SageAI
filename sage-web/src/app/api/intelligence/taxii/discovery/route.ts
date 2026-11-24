import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TAXII_DISCOVERY = {
  title: "SageAI Sovereign Threat Intelligence TAXII Server",
  description: "TAXII 2.1 API Root for enterprise SIEM/SOAR clusters",
  contact: "soc@sageai.security",
  default: "/api/intelligence/taxii/v21/",
  api_roots: ["/api/intelligence/taxii/v21/"],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/intelligence/taxii/discovery`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_TAXII_DISCOVERY);
    }
    const data = await safeUpstreamJson(res, FALLBACK_TAXII_DISCOVERY);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_TAXII_DISCOVERY);
  }
}
