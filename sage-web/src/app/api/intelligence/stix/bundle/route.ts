import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_STIX_BUNDLE = {
  type: "bundle",
  id: "bundle--d8471bfa-8921-4f12-9c12-781290348712",
  spec_version: "2.1",
  objects: [
    {
      type: "identity",
      spec_version: "2.1",
      id: "identity--sageai-cti-hub",
      name: "SageAI Sovereign Cyber Threat Intelligence Hub",
      identity_class: "organization",
    },
    {
      type: "threat-actor",
      spec_version: "2.1",
      id: "threat-actor--apt-fin8",
      name: "APT-FIN8",
      threat_actor_types: ["crime-syndicate"],
      confidence: 95,
    },
    {
      type: "infrastructure",
      spec_version: "2.1",
      id: "infrastructure--c2-fin8",
      name: "Adversary C2 Server (194.26.29.114)",
      infrastructure_types: ["command-and-control"],
      confidence: 90,
    },
    {
      type: "indicator",
      spec_version: "2.1",
      id: "indicator--fin8-ip",
      name: "Malicious C2 IP: 194.26.29.114",
      pattern: "[ipv4-addr:value = '194.26.29.114']",
      pattern_type: "stix",
      confidence: 95,
    },
    {
      type: "relationship",
      spec_version: "2.1",
      id: "relationship--fin8-uses-c2",
      relationship_type: "uses",
      source_ref: "threat-actor--apt-fin8",
      target_ref: "infrastructure--c2-fin8",
    },
  ],
  total_objects: 5,
  generated_at: new Date().toISOString(),
  actor_filter: null,
};

export async function GET(request: NextRequest) {
  try {
    const actor = request.nextUrl.searchParams.get("actor");
    const url = actor
      ? `${BACKEND}/api/intelligence/stix/bundle?actor=${encodeURIComponent(actor)}`
      : `${BACKEND}/api/intelligence/stix/bundle`;

    const res = await fetchBackend(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_STIX_BUNDLE);
    }
    const data = await safeUpstreamJson(res, FALLBACK_STIX_BUNDLE);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_STIX_BUNDLE);
  }
}
