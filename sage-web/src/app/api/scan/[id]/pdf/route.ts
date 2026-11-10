import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  fetchBackend,
  isValidResourceId,
  sanitizeFilenamePrefix,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid scan ID" }, { status: 400 });
  }

  try {
    const res = await fetchBackend(
      `${backendUrl}/reports/${encodeURIComponent(id)}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      45000
    );

    if (!res.ok) {
      if (res.status === 402) {
        const err = await safeUpstreamJson<{ detail?: string }>(res, {});
        return NextResponse.json(
          { error: err.detail || "Upgrade required" },
          { status: 402 }
        );
      }
      return NextResponse.json(
        { error: "PDF generation failed" },
        { status: res.status }
      );
    }

    const pdfBuffer = await res.arrayBuffer();
    const safePrefix = sanitizeFilenamePrefix(id, "report");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sageai-report-${safePrefix}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 502 }
    );
  }
}
