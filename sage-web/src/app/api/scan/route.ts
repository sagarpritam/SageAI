import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
  console.warn("Upstash Redis is not configured. Falling back to mock.");
}

export async function POST(req: Request) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized. Please sign in to scan." }, { status: 401 });
  }

  let userId = "unknown";
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    userId = payload.sub || "unknown";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {}

  const body = await req.json();
  const { target } = body;
  if (!target || typeof target !== "string") {
    return NextResponse.json({ error: "Target URL or domain is required" }, { status: 400 });
  }

  // Normalize target URL
  let cleanTarget = target.trim();
  if (!cleanTarget.startsWith("http://") && !cleanTarget.startsWith("https://")) {
    cleanTarget = `https://${cleanTarget}`;
  }

  // Validate URL and enforce SSRF check against private networks & metadata endpoints
  try {
    const parsed = new URL(cleanTarget);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only HTTP and HTTPS targets are permitted." }, { status: 400 });
    }
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "169.254.169.254" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return NextResponse.json({ error: "Scanning private or loopback IP ranges is strictly prohibited." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid target URL format." }, { status: 400 });
  }

  // Optional Redis-based rate limiting (fast pre-check)
  if (redis) {
    const isPro = await redis.get(`is_pro:${userId}`);
    if (!isPro) {
      const scanCount = await redis.incr(`scan_count:${userId}`);
      if (scanCount > 3) {
        return NextResponse.json({ error: "Free limit reached.", limitReached: true }, { status: 403 });
      }
    }
  }

  try {
    const backendRes = await fetch(`${backendUrl}/scan`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ target: cleanTarget })
    });

    // Relay 402 Payment Required from backend
    if (backendRes.status === 402) {
      const err = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.detail || "Scan limit reached.", limitReached: true },
        { status: 402 }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ scan_id: "mock-" + Date.now() });
  }
}

