import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/ai-spm/inspect-prompt`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackInspection(body.prompt || ""));
  } catch {
    const body = await req.json().catch(() => ({ prompt: "" }));
    return NextResponse.json(getFallbackInspection(body.prompt || ""));
  }
}

function getFallbackInspection(prompt: string) {
  const isJailbreak = /ignore\s+(all\s+)?previous/i.test(prompt) || /DAN/i.test(prompt);
  return {
    status: "success",
    inspection: {
      timestamp: new Date().toISOString(),
      prompt_length: prompt.length,
      is_safe: !isJailbreak,
      risk_score: isJailbreak ? 90 : 0,
      threats_detected: isJailbreak ? 1 : 0,
      enforcement_decision: isJailbreak ? "QUARANTINE_REQUEST" : "ALLOW",
      detections: isJailbreak
        ? [
            {
              category: "LLM01: Prompt Injection / Jailbreak",
              severity: "CRITICAL",
              matched_pattern: "ignore previous instructions",
              mitre_atlas: "AML.T0051",
              action: "BLOCK_AND_LOG",
            },
          ]
        : [],
    },
  };
}

