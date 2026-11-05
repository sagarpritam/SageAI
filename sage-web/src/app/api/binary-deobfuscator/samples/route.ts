import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/binary-deobfuscator/samples`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackSamples());
  } catch {
    return NextResponse.json(getFallbackSamples());
  }
}

function getFallbackSamples() {
  return {
    status: "success",
    samples: [
      {
        sample_name: "LummaStealer_Packed_Dropper.bin",
        sha256: "8a7f9c1b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
        architecture: "x86_64",
        obfuscation_type: "OLLVM Control Flow Flattening + Opaque Predicates",
      },
      {
        sample_name: "QakBot_StringTable_Packed.dll",
        sha256: "4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
        architecture: "x86_32",
        obfuscation_type: "Control Flow Indirection + RC4 String Tables",
      },
    ],
  };
}

