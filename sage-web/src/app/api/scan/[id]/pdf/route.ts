import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const res = await fetch(`${backendUrl}/reports/${id}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 402) {
         const err = await res.json().catch(() => ({}));
         return NextResponse.json({ error: err.detail || "Upgrade required" }, { status: 402 });
      }
      return NextResponse.json(
        { error: "PDF generation failed" },
        { status: res.status }
      );
    }

    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sageai-report-${id}.pdf"`,
      },
    });
  } catch (e) {
    console.error("PDF proxy error:", e);
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 502 }
    );
  }
}

