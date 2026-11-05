import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/api-shield/opa-rego`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackRego());
  } catch {
    return NextResponse.json(getFallbackRego());
  }
}

function getFallbackRego() {
  return {
    status: "success",
    opa_policy: {
      policy_id: `opa-rego-${Date.now()}`,
      language: "Rego (Open Policy Agent v0.60+)",
      gateway_target: "Envoy / Istio / Kong Service Mesh",
      rego_code:
        "package sageai.authz\n\ndefault allow = false\n\n# 1. Block BOLA\nallow {\n    input.method == \"GET\"\n    input.user.tenant_id == input.resource.tenant_id\n}\n\n# 2. Block BFLA\nallow {\n    input.method == \"DELETE\"\n    input.user.role == \"ADMIN\"\n    input.user.mfa_verified == true\n}\n\n# 3. Block Mass Assignment\ndeny_mass_assignment {\n    input.body.is_admin\n}\ndeny_mass_assignment {\n    input.body.role\n}\n",
      timestamp: new Date().toISOString(),
    },
  };
}
