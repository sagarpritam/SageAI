import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TAXII_COLLECTIONS = {
  api_root: "/api/intelligence/taxii/v21/",
  taxii_version: "2.1",
  collections: [
    {
      id: "sage-syndicate-cti",
      title: "SageAI Sovereign Cyber Threat Intelligence Stream",
      description: "Continuous adversary link graph STIX 2.1 intelligence package broadcast",
      can_read: true,
      can_write: false,
      media_types: ["application/taxii+json;version=2.1"],
    },
  ],
  server_status: "TAXII_2.1_SERVER_ONLINE",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/intelligence/taxii/collections`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_TAXII_COLLECTIONS);
    }
    const data = await safeUpstreamJson(res, FALLBACK_TAXII_COLLECTIONS);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_TAXII_COLLECTIONS);
  }
}
