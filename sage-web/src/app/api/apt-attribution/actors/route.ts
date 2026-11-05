import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/apt-attribution/actors`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackActors());
  } catch {
    return NextResponse.json(getFallbackActors());
  }
}

function getFallbackActors() {
  return {
    status: "success",
    actors: [
      {
        actor_id: "apt-volt-typhoon",
        name: "Volt Typhoon (Bronze Silhouette)",
        origin: "People's Republic of China (PRC)",
        motivation: "Espionage / Pre-positioning on Critical Infrastructure",
        target_sectors: ["Energy", "Water Systems", "Telecommunications"],
        diamond_model: {
          adversary: "PRC State-Sponsored Actors",
          capabilities: ["Living-off-the-Land (LotL)", "KV-botnet", "SOHO Router Proxy Mesh"],
          infrastructure: ["Fortinet FortiGate VPNs", "Cisco RV series"],
          victimology: ["US Critical Infrastructure", "Guam Telecommunications"],
        },
        confidence_score: 96.5,
      },
      {
        actor_id: "apt-lazarus",
        name: "Lazarus Group (Hidden Cobra / Diamond Sleet)",
        origin: "Democratic People's Republic of Korea (DPRK)",
        motivation: "Financial Theft / Cryptocurrency Heists",
        target_sectors: ["Cryptocurrency Exchanges", "DeFi Protocols", "Defense"],
        diamond_model: {
          adversary: "Reconnaissance General Bureau (RGB)",
          capabilities: ["RustBucket", "AppleJeus", "BlindingCan"],
          infrastructure: ["Bulletproof ASNs", "Fast-Flux Dynamic DNS"],
          victimology: ["Global Fintech", "Web3 Bridges"],
        },
        confidence_score: 98.2,
      },
      {
        actor_id: "apt-cozy-bear",
        name: "APT29 (Midnight Blizzard / Cozy Bear / Nobelium)",
        origin: "Russian Federation (SVR)",
        motivation: "Strategic Geopolitical Espionage",
        target_sectors: ["Government Ministries", "NATO Allies", "Cloud Providers"],
        diamond_model: {
          adversary: "Foreign Intelligence Service (SVR)",
          capabilities: ["MagicWeb", "EnvyScout", "WellMess"],
          infrastructure: ["Microsoft 365 Tenant Hijacking", "Tor Ingress Exits"],
          victimology: ["US Executive Agencies", "Foreign Affairs Ministries"],
        },
        confidence_score: 97.4,
      },
    ],
  };
}

