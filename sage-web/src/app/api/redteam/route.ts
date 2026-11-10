import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isValidResourceId,
  safeJsonBody,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const jobId = searchParams.get("job_id");
  const ns = searchParams.get("namespace") || "default";

  if (jobId && !isValidResourceId(jobId)) {
    return NextResponse.json({ error: "Invalid job_id" }, { status: 400 });
  }

  let endpoint = `${BACKEND}/redteam/targets?namespace=${encodeURIComponent(ns)}`;
  if (action === "presets") {
    endpoint = `${BACKEND}/redteam/presets`;
  } else if (action === "jobs") {
    endpoint = `${BACKEND}/redteam/jobs?namespace=${encodeURIComponent(ns)}`;
  } else if (jobId) {
    endpoint = `${BACKEND}/redteam/results/${encodeURIComponent(jobId)}?namespace=${encodeURIComponent(ns)}`;
  }

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from redteam service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to redteam service" },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await safeJsonBody<{ _action?: unknown }>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  const body = parsed.data;
  const action = body._action || "target";

  let endpoint = `${BACKEND}/redteam/targets`;
  if (action === "audit") {
    endpoint = `${BACKEND}/redteam/audit`;
  } else if (action === "evaluate-guardrail") {
    endpoint = `${BACKEND}/redteam/evaluate-guardrail`;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from redteam service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to redteam service" },
      { status: 502 }
    );
  }
}
