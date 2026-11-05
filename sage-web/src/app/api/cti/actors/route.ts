import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND}/cti/threat-actors`, {
      method: "GET",
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(getFallbackThreatActors());
  } catch {
    return NextResponse.json(getFallbackThreatActors());
  }
}

function getFallbackThreatActors() {
  return {
    status: "success",
    threat_actors: [
      {
        id: "threat-actor--b24e8156",
        name: "APT28 (Fancy Bear / Strontium)",
        origin: "Russian Federation (GRU)",
        primary_motivation: "ESPIONAGE",
        targeted_sectors: ["Government", "Defense", "Energy"],
        known_tools: ["X-Agent", "Zebrocy", "Mimikatz"],
      },
      {
        id: "threat-actor--c94f1287",
        name: "Lazarus Group (HIDDEN COBRA)",
        origin: "DPRK (RGB)",
        primary_motivation: "FINANCIAL_AND_ESPIONAGE",
        targeted_sectors: ["Cryptocurrency", "Defense", "Finance"],
        known_tools: ["Brambul", "Joanap", "Fallchill"],
      },
      {
        id: "threat-actor--d1028374",
        name: "Scattered Spider (UNC3944)",
        origin: "Transnational Cybercrime Syndicate",
        primary_motivation: "EXTORTION_AND_DATA_THEFT",
        targeted_sectors: ["Identity Providers", "Tech", "Retail"],
        known_tools: ["Sliver", "AnyDesk", "Mimikatz"],
      },
      {
        id: "threat-actor--e5019283",
        name: "LockBit 3.0 (LockBit Black)",
        origin: "RaaS Syndicate",
        primary_motivation: "FINANCIAL_EXTORTION",
        targeted_sectors: ["Healthcare", "Manufacturing", "Finance"],
        known_tools: ["LockBit 3.0 Encryptor", "StealBit"],
      },
    ],
  };
}

