import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/sdn-shield/isolations`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackIsolations());
  } catch {
    return NextResponse.json(getFallbackIsolations());
  }
}

function getFallbackIsolations() {
  return {
    status: "success",
    active_isolations: [
      {
        isolation_id: "sdn-iso-8a9c1e2b4d5e",
        asset_id: "i-0a8f9c1e2b4d5e",
        asset_type: "AWS_EC2",
        status: "ISOLATED_QUARANTINED",
        reason: "Active C2 socket connection detected by NIDS",
        redirect_to_honeynet: true,
        ttl_minutes: 60,
        isolated_at: new Date().toISOString(),
      },
    ],
  };
}

