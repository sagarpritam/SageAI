import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const backendRes = await fetch(`http://localhost:8000/scan/${id}`, {
      headers: {
        "Authorization": `Bearer ${process.env.INTERNAL_SERVICE_KEY || "dev-internal-key-123"}`
      }
    });
    const data = await backendRes.json();
    return NextResponse.json(data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ status: "running" }); // Mock default
  }
}
