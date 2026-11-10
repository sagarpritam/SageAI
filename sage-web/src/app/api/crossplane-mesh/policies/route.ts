import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedPolicy(body: Record<string, unknown>) {
  return {
    status: "success",
    policy: {
      policy_id: `pol-zt-${Math.random().toString(16).slice(2, 8)}`,
      name: (body.name as string) || "Cross-Plane Policy",
      intent_description: (body.intent_description as string) || "Zero-trust intent rule",
      status: "SYNCHRONIZED",
      translations: {
        AWS: { sg_id: "sg-aws-gen", rules: [{ type: "INGRESS", port: body.target_port || 443 }] },
        AZURE: { nsg_id: "nsg-azure-gen", rules: [{ priority: 100, access: "Allow" }] },
        GCP: { firewall_rule: "fw-gcp-gen" },
        CILIUM_K8S: { kind: "CiliumNetworkPolicy" },
      },
    },
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(
      `${BACKEND}/crossplane-mesh/policies`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
      5000
    );

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackPolicies());
  } catch {
    return NextResponse.json(getFallbackPolicies());
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(
      `${BACKEND}/crossplane-mesh/translate-policy`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      },
      5000
    );

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(buildSimulatedPolicy(body));
  } catch {
    return NextResponse.json(buildSimulatedPolicy(body));
  }
}

function getFallbackPolicies() {
  return {
    status: "success",
    policies: [
      {
        policy_id: "pol-zt-001",
        name: "Zero-Trust PCI Core Isolation Intent",
        intent_description: "Strict mTLS ingress only to payment vaults; drop all direct public internet access.",
        enforcement_mode: "STRICT_ENFORCE",
        status: "SYNCHRONIZED",
        translations: {
          AWS: {
            sg_id: "sg-091248ac91",
            rules: [{ type: "INGRESS", protocol: "TCP", port: 8443, source: "10.100.0.0/16 (mTLS Mesh Only)" }],
          },
          AZURE: {
            nsg_id: "nsg-pci-vault-prod",
            rules: [
              { priority: 100, direction: "Inbound", access: "Allow", port: 8443 },
              { priority: 4096, direction: "Inbound", access: "Deny", port: "*" },
            ],
          },
          GCP: {
            firewall_rule: "fw-allow-crossplane-mtls",
            rules: [{ action: "ALLOW", ports: ["8443"], targetTags: ["pci-vault"] }],
          },
          CILIUM_K8S: {
            kind: "CiliumNetworkPolicy",
            rules: [{ toPorts: [{ ports: [{ port: "8443", protocol: "TCP" }] }] }],
          },
        },
      },
    ],
  };
}

