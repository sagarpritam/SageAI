import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TRANSITS = [
  {
    transit_id: "TRANSIT-AS174-COGENT",
    asn: 174,
    provider_name: "Cogent Communications",
    target_pop: "POP-US-EAST",
    primary_ixp: "Equinix IX Ashburn",
    current_jitter_ms: 2.1,
    packet_loss_pct: 0.02,
    route_flaps_last_hour: 0,
    health_status: "OPTIMAL",
    diverted: false,
    active_path: "DIRECT_ASN_TRANSIT",
  },
  {
    transit_id: "TRANSIT-AS3356-LUMEN",
    asn: 3356,
    provider_name: "Lumen / Level 3",
    target_pop: "POP-EU-WEST",
    primary_ixp: "DE-CIX Frankfurt",
    current_jitter_ms: 18.4,
    packet_loss_pct: 3.85,
    route_flaps_last_hour: 4,
    health_status: "DEGRADED",
    diverted: true,
    active_path: "DIVERTED_TO_DECIX_FRANKFURT_IXP",
    divert_latency_ms: 28.6,
  },
  {
    transit_id: "TRANSIT-AS1299-ARELION",
    asn: 1299,
    provider_name: "Arelion (Telia Carrier)",
    target_pop: "POP-APAC-SOUTH",
    primary_ixp: "SGIX Singapore",
    current_jitter_ms: 3.4,
    packet_loss_pct: 0.05,
    route_flaps_last_hour: 0,
    health_status: "OPTIMAL",
    diverted: false,
    active_path: "DIRECT_ASN_TRANSIT",
  },
  {
    transit_id: "TRANSIT-AS2914-NTT",
    asn: 2914,
    provider_name: "NTT Global IP Network",
    target_pop: "POP-US-CENTRAL",
    primary_ixp: "Equinix Chicago IX",
    current_jitter_ms: 1.8,
    packet_loss_pct: 0.01,
    route_flaps_last_hour: 0,
    health_status: "OPTIMAL",
    diverted: false,
    active_path: "DIRECT_ASN_TRANSIT",
  },
  {
    transit_id: "TRANSIT-AS6939-HE",
    asn: 6939,
    provider_name: "Hurricane Electric",
    target_pop: "POP-GOV-WEST",
    primary_ixp: "Seattle Internet Exchange (SIX)",
    current_jitter_ms: 1.2,
    packet_loss_pct: 0.0,
    route_flaps_last_hour: 0,
    health_status: "OPTIMAL",
    diverted: false,
    active_path: "DIRECT_ASN_TRANSIT",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/infrastructure/geo-diverter/transits`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_TRANSITS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback geo transits:", e);
  }
  return NextResponse.json(FALLBACK_TRANSITS);
}
