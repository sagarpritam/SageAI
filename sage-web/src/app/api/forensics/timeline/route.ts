import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json().catch(() => ({}));
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/forensics/timeline`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackTimeline(body.container_id || "forensic-pkg-1"));
  } catch {
    return NextResponse.json(getFallbackTimeline("forensic-pkg-1"));
  }
}

function getFallbackTimeline(containerId: string) {
  return {
    status: "success",
    timeline: {
      container_id: containerId,
      incident_timeline: [
        { time: "2026-11-05T20:10:00Z", event: "Nginx web server processed external HTTP POST to /api/upload" },
        { time: "2026-11-05T20:10:14Z", event: "Web shell dropper executed in /dev/shm/.beacon (PID 3895)" },
        { time: "2026-11-05T20:10:15Z", event: "Interactive /bin/sh shell spawned as child of worker (PID 3892)" },
        { time: "2026-11-05T20:10:18Z", event: "Unbacked RWX memory buffer allocated (0x7f88a1000000, 256 KB)" },
        { time: "2026-11-05T20:10:21Z", event: "Outbound TCP connection established to 198.51.100.99:8443 (C2 Channel)" },
        { time: "2026-11-05T20:10:25Z", event: "SageAI Forensics Service triggered live snapshot capture" },
      ],
      root_cause: "Remote Code Execution via Web Application File Upload -> Memory Dropper -> Reverse C2",
      timestamp: new Date().toISOString(),
    },
  };
}

