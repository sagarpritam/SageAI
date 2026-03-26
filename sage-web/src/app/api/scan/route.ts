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

  let limitReached = false;

  if (redis) {
    const isPro = await redis.get(`is_pro:${userId}`);
    if (!isPro) {
      const scanCount = await redis.incr(`scan_count:${userId}`);
      if (scanCount > 3) {
        limitReached = true;
      }
    }
  } else {
    // Mock limit for dev without redis
    console.log("No redis, skipping rate limit check");
  }

  if (limitReached) {
    return NextResponse.json({ error: "Free limit reached.", limitReached: true }, { status: 403 });
  }

  try {
    const backendRes = await fetch("http://localhost:8000/scan", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ target })
    });
    const data = await backendRes.json();
    return NextResponse.json(data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ scan_id: "mock-" + Date.now() });
  }
}
