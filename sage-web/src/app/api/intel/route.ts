import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

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
    const res = await fetchBackend(`${BACKEND}/intel/modules`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await safeUpstreamJson(res, { detail: "Intel modules error" });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to intelligence service" },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await safeJsonBody<{ module?: unknown }>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  const body = parsed.data;
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

  try {
    const res = await fetchBackend(`${BACKEND}/intel/${targetModule}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await safeUpstreamJson(res, { detail: "Intel scan failed" });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to intelligence service" },
      { status: 502 }
    );
  }
}
