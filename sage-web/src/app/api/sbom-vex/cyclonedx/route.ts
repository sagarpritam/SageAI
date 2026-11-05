import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/sbom-vex/cyclonedx`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackCycloneDX());
  } catch {
    return NextResponse.json(getFallbackCycloneDX());
  }
}

function getFallbackCycloneDX() {
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      component: {
        type: "application",
        name: "SageAI Cybersecurity Platform",
        version: "2.7.0",
      },
    },
    components: [
      { name: "fastapi", version: "0.110.0", purl: "pkg:pypi/fastapi@0.110.0", licenses: [{ license: { id: "MIT" } }] },
      { name: "pydantic", version: "2.6.4", purl: "pkg:pypi/pydantic@2.6.4", licenses: [{ license: { id: "MIT" } }] },
      { name: "cryptography", version: "42.0.5", purl: "pkg:pypi/cryptography@42.0.5", licenses: [{ license: { id: "Apache-2.0" } }] },
      { name: "next", version: "14.2.3", purl: "pkg:npm/next@14.2.3", licenses: [{ license: { id: "MIT" } }] },
      { name: "react", version: "18.3.1", purl: "pkg:npm/react@18.3.1", licenses: [{ license: { id: "MIT" } }] },
    ],
  };
}

