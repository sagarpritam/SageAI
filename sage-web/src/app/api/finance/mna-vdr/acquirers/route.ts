import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_ACQUIRERS = [
  {
    id: "ACQ-CISCO-CORP-DEV",
    acquirer_name: "Cisco Systems Corporate Development",
    tier: "Strategic Tier-1",
    nda_status: "FULLY_EXECUTED_MUTUAL",
    cleanroom_clearance: "LEVEL_4_FULL_ALGO_AUDIT",
    last_access: "2026-11-17T17:40:00Z",
    diligence_focus: "eBPF Kernel Mesh & Anycast BGP Guard",
    watermark_id: "WM-CSCO-9912",
  },
  {
    id: "ACQ-PANW-MNA",
    acquirer_name: "Palo Alto Networks Strategy & Ventures",
    tier: "Strategic Tier-1",
    nda_status: "FULLY_EXECUTED_MUTUAL",
    cleanroom_clearance: "LEVEL_4_FULL_ALGO_AUDIT",
    last_access: "2026-11-17T18:05:00Z",
    diligence_focus: "Autonomous Post-Quantum & Edge WAF",
    watermark_id: "WM-PANW-8402",
  },
  {
    id: "ACQ-CRWD-VENTURES",
    acquirer_name: "CrowdStrike Corporate Development",
    tier: "Strategic Tier-1",
    nda_status: "FULLY_EXECUTED_MUTUAL",
    cleanroom_clearance: "LEVEL_3_TECHNICAL_EVAL",
    last_access: "2026-11-17T16:15:00Z",
    diligence_focus: "Global CTI Panopticon & HoneyNet",
    watermark_id: "WM-CRWD-6619",
  },
  {
    id: "ACQ-MSFT-SECURITY",
    acquirer_name: "Microsoft Security & Enterprise M&A",
    tier: "Strategic Tier-1",
    nda_status: "STAGE_2_MANAGEMENT_REVIEW",
    cleanroom_clearance: "LEVEL_3_TECHNICAL_EVAL",
    last_access: "2026-11-17T15:20:00Z",
    diligence_focus: "Sovereign HSM Quorum & Cloud Run FinOps",
    watermark_id: "WM-MSFT-4029",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/mna-vdr/acquirers`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_ACQUIRERS>(res, FALLBACK_ACQUIRERS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback M&A acquirers:", e);
  }
  return NextResponse.json(FALLBACK_ACQUIRERS);
}
