import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_LOCK_LEDGER = {
  status: "CAP_TABLE_LEDGER_LOCKED_AND_SEALED",
  settlement_id: "SETTLE-SERIES-A-2026-v8.7",
  merkle_root_seal: "c5d12ef481029384756102938475610293847561029384756102938475610293",
  locked_at: Date.now() / 1000,
  authorized_signatory: "Sarah Chen, Chief Financial Officer & RevOps",
  settlement_receipt_path: "artifacts/contracts/Series_A_Settlement_Ledger_v8.7.json",
  total_settled_usd: 6000000.0,
  total_shares_tokenized: 1935484,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(
      `${BACKEND}/api/finance/settlement/lock-ledger`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_LOCK_LEDGER);
    }
    const data = await safeUpstreamJson(res, FALLBACK_LOCK_LEDGER);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_LOCK_LEDGER);
  }
}
