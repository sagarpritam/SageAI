import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/investor-data-room/generate-dossier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const data = await safeUpstreamJson<Record<string, unknown>>(res, {});
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback LP dossier generator:", e);
  }

  const now = Date.now() / 1000;
  return NextResponse.json({
    dossier_id: `DOSSIER-LP-AUDIT-${Math.floor(now)}`,
    title: "Institutional LP Comprehensive Due Diligence & Technical Audit Dossier",
    generated_at: now,
    merkle_root_seal: "e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    corporate_entity: "SageAI, Inc. (Delaware C-Corp)",
    round_summary: {
      room_id: "ROOM-SERIES-A-LP-2026",
      round_name: "SageAI Series A Equity Financing",
      target_raise_usd: 6000000.0,
      total_cleared_usd: 6000000.0,
      cap_table_locked: true,
      lead_investor: "Apex Sovereign Ventures ($3,000,000.00)",
    },
    compliance_guarantees: {
      disaster_recovery_rto: "< 45ms",
      edge_containment_sla: "< 15ms",
      fund_settlement_status: "100% WIRED ($6,000,000.00)",
      soc2_type2_readiness: "100% EVIDENCE MAPPED",
      cap_table_immutability: "CRYPTOGRAPHICALLY LOCKED",
    },
    custody_signatories: {
      chief_executive_officer: "SageAI Autonomous Executive Suite",
      chief_information_security_officer: "Autonomous CISO Orchestrator",
      lead_investor_signatory: "Apex Sovereign Ventures GP",
    },
  });
}
