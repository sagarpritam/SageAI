import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const serviceKey = process.env.INTERNAL_SERVICE_KEY || "";

  try {
    const res = await fetch(`${backendUrl}/scan/${id}/pdf`, {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    if (!res.ok) {
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
