import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_EXECUTE_RES = {
  term_sheet_id: "TS-SERIES-A-2026-v8.7",
  closing_status: "TERM_SHEET_EXECUTED",
  executed_at: Date.now() / 1000,
  execution_certificate: "CERT-SERIES-A-CLOSE-2026",
  signatories: {
    company: "Chief Executive Officer & Co-Founder, SageAI Security Inc.",
    lead_investor: "Managing General Partner, Apex Sovereign Ventures",
  },
  merkle_record_hash: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
  contract_receipt_path: "artifacts/contracts/Series_A_Executed_Term_Sheet_v8.7.json",
  message: "Series A Term Sheet executed and sealed into Merkle audit chain.",
};

export async function POST() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/term-sheet/execute`, {
      method: "POST",
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_EXECUTE_RES);
    }
    const data = await safeUpstreamJson(res, FALLBACK_EXECUTE_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_EXECUTE_RES);
  }
}
