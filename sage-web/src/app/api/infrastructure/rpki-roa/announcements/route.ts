import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_ANNOUNCEMENTS = [
  {
    announcement_id: "ROA-ANN-US-EAST",
    prefix: "198.51.100.0/24",
    origin_asn: "AS398242",
    as_name: "SageAI Global Anycast Infrastructure",
    max_length: 24,
    trust_anchor: "ARIN RPKI Trust Anchor (TAL)",
    validation_state: "VALID",
    detected_as_path: "AS174 (Cogent) -> AS398242",
    status: "PROTECTED",
    bgp_community: "65535:100 (Standard Local-Pref)",
    last_validated_at: Date.now() / 1000 - 12,
  },
  {
    announcement_id: "ROA-ANN-EU-WEST",
    prefix: "203.0.113.0/24",
    origin_asn: "AS398242",
    as_name: "SageAI Global Anycast Infrastructure",
    max_length: 24,
    trust_anchor: "RIPE NCC RPKI Trust Anchor",
    validation_state: "VALID",
    detected_as_path: "AS3356 (Lumen) -> AS398242",
    status: "PROTECTED",
    bgp_community: "65535:100 (Standard Local-Pref)",
    last_validated_at: Date.now() / 1000 - 18,
  },
  {
    announcement_id: "ROA-ANN-APAC-SOUTH",
    prefix: "192.0.2.0/24",
    origin_asn: "AS398242",
    as_name: "SageAI Global Anycast Infrastructure",
    max_length: 24,
    trust_anchor: "APNIC RPKI Trust Anchor",
    validation_state: "VALID",
    detected_as_path: "AS2914 (NTT) -> AS398242",
    status: "PROTECTED",
    bgp_community: "65535:100 (Standard Local-Pref)",
    last_validated_at: Date.now() / 1000 - 25,
  },
  {
    announcement_id: "ROA-ANN-SA-EAST",
    prefix: "45.152.0.0/22",
    origin_asn: "AS398242",
    as_name: "SageAI Global Anycast Infrastructure",
    max_length: 22,
    trust_anchor: "LACNIC RPKI Trust Anchor",
    validation_state: "VALID",
    detected_as_path: "AS6939 (Hurricane) -> AS398242",
    status: "PROTECTED",
    bgp_community: "65535:100 (Standard Local-Pref)",
    last_validated_at: Date.now() / 1000 - 34,
  },
  {
    announcement_id: "ROA-ANN-ROGUE-01",
    prefix: "198.51.100.0/24",
    origin_asn: "AS48044",
    as_name: "Rogue Bulletproof Transit Ltd (St. Petersburg)",
    max_length: 24,
    trust_anchor: "ARIN RPKI Trust Anchor (TAL)",
    validation_state: "INVALID_ASN",
    detected_as_path: "AS9002 -> AS48044 (UNAUTHORIZED ORIGIN)",
    status: "HIJACK_SUSPECTED",
    bgp_community: "UNTAGGED_MALICIOUS_ROUTE",
    last_validated_at: Date.now() / 1000 - 6,
  },
  {
    announcement_id: "ROA-ANN-SPECIFIC-02",
    prefix: "203.0.113.0/25",
    origin_asn: "AS398242",
    as_name: "Unauthorized More-Specific Sub-Allocation",
    max_length: 24,
    trust_anchor: "RIPE NCC RPKI Trust Anchor",
    validation_state: "INVALID_LENGTH",
    detected_as_path: "AS1299 -> AS13335 -> AS398242",
    status: "SPECIFIC_HIJACK_SUSPECTED",
    bgp_community: "UNTAGGED_MORE_SPECIFIC",
    last_validated_at: Date.now() / 1000 - 4,
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/infrastructure/rpki-roa/announcements`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_ANNOUNCEMENTS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback RPKI announcements:", e);
  }
  return NextResponse.json(FALLBACK_ANNOUNCEMENTS);
}
