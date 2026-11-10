import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ALLOWED_COMPLIANCE_QUERY_FRAMEWORKS,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const framework = (req.nextUrl.searchParams.get("framework") || "soc2")
    .trim()
    .toLowerCase();
  if (!ALLOWED_COMPLIANCE_QUERY_FRAMEWORKS.has(framework)) {
    return NextResponse.json(
      { error: "Unsupported compliance framework" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${BACKEND}/compliance/report?framework=${encodeURIComponent(framework)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Compliance report generation failed" },
        { status: res.status }
      );
    }

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from compliance service",
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to compliance service" },
      { status: 502 }
    );
  }
}
