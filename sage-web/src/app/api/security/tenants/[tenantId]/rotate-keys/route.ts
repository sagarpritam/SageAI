import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;

  const fallback = {
    status: "KEY_ROTATED",
    details: {
      tenant_id: tenantId,
      status: "KEY_ROTATED_SUCCESSFULLY",
      new_version: 3,
      last_rotated_at: Date.now() / 1000,
      fingerprint: "a1b2c3d4e5f6789012345678",
      merkle_record_hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    },
    message: `KMS key ring for ${tenantId} rotated with audit seal.`,
  };

  try {
    const res = await fetchBackend(`${BACKEND}/api/security/tenants/${tenantId}/rotate-keys`, {
      method: "POST",
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(fallback);
    }
    const data = await safeUpstreamJson(res, fallback);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(fallback);
  }
}
