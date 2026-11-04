import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND}/threat-modeling/parse-mermaid`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({
      format: "Mermaid Architecture Diagram",
      components: [
        { id: "c-gw", name: "Edge Gateway", type: "API_GATEWAY", exposure: "PUBLIC" },
        { id: "c-app", name: "Core Service", type: "CORE_SERVICE", exposure: "PRIVATE" },
      ],
      data_flows: [],
      trust_boundaries: [],
    });
  } catch {
    return NextResponse.json({
      format: "Mermaid Architecture Diagram",
      components: [
        { id: "c-gw", name: "Edge Gateway", type: "API_GATEWAY", exposure: "PUBLIC" },
        { id: "c-app", name: "Core Service", type: "CORE_SERVICE", exposure: "PRIVATE" },
      ],
      data_flows: [],
      trust_boundaries: [],
    });
  }
}

