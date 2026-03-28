import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const backendRes = await fetch(`${backendUrl}/scan/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (backendRes.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ status: "running" }); // Mock default
  }
}
