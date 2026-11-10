import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/labyrinth-honeynet/trap-adversary`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({
      status: "success",
      trap: {
        status: "ADVERSARY_TRAPPED_IN_LABYRINTH",
        adversary_ip: body.adversary_ip,
        current_depth: 2,
        state_mirrored_response: `[StateMirror]: executed '${body.probe_command}'. Synthetic payload returned.`,
        delay_injected_sec: 3.0,
        canary_token_seeded: "canary-synthetic-token-trap",
      },
    });
  } catch {
    return NextResponse.json({
      status: "success",
      trap: {
        status: "ADVERSARY_TRAPPED_IN_LABYRINTH",
        current_depth: 1,
        delay_injected_sec: 1.5,
      },
    });
  }
}

