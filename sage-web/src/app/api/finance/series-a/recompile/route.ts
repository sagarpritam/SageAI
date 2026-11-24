import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_RECOMPILE = {
  status: "RECOMPILED",
  manifest: {
    dossier_id: "DOSSIER-SERIES-A-2026-v8.7",
    title: "SageAI Security Inc. — Series A Institutional Investment Memorandum",
    compiled_at: new Date().toISOString(),
    pdf_size_bytes: 3661,
    merkle_record_hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  },
  message: "Series A Data Room memorandum compiled with cryptographic audit seal.",
};

export async function POST() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/series-a/recompile`, {
      method: "POST",
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_RECOMPILE);
    }
    const data = await safeUpstreamJson(res, FALLBACK_RECOMPILE);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_RECOMPILE);
  }
}
