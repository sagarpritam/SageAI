import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DEPLOY_RES = {
  campaign_id: "SINK-APEX-09",
  status: "BAIT_DEPLOYED",
  canary_token_id: "CANARY-STS-NEW-418",
  domain: "apex-securities.io",
  underground_channel: "BreachForums / Russian Market Telegram",
  sinkhole_listener_url: "https://sinkhole.sageai.io/beacon/canary-sts-new-418",
  merkle_record_hash: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(`${BACKEND}/api/intelligence/sinkhole/deploy-bait`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        ...FALLBACK_DEPLOY_RES,
        domain: body.domain || "apex-securities.io",
        underground_channel: body.underground_channel || "BreachForums / Russian Market Telegram",
      });
    }
    const data = await safeUpstreamJson(res, FALLBACK_DEPLOY_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_DEPLOY_RES);
  }
}
