import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const ALLOWED_INTEL_MODULES = new Set([
  "sweep",
  "shodan",
  "censys",
  "intelx",
  "osint-industries",
  "spiderfoot",
  "recon-ng",
  "darkweb",
  "identity",
  "graph",
  "deep-search",
]);

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${BACKEND}/intel/modules`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({ detail: "Intel modules error" }));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to connect to intelligence service",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const targetModule =
      typeof body.module === "string" && body.module.trim()
        ? body.module.trim()
        : "sweep";
    if (!ALLOWED_INTEL_MODULES.has(targetModule)) {
      return NextResponse.json(
        { error: `Unsupported intel module: ${targetModule}` },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND}/intel/${targetModule}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({ detail: "Intel scan failed" }));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to connect to intelligence service",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}
