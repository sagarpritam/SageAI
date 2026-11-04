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

    const res = await fetch(`${BACKEND}/threat-modeling/templates`, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(getFallbackTemplates());
  } catch {
    return NextResponse.json(getFallbackTemplates());
  }
}

function getFallbackTemplates() {
  return {
    status: "success",
    templates: {
      cloud_microservices: {
        name: "Cloud Microservices & Multi-Tenant SaaS",
        description: "Distributed cloud architecture with API Gateway, Auth Microservice, Multi-Tenant Database, and Redis Bus.",
        components: [
          { id: "comp-1", name: "Edge API Gateway", type: "API_GATEWAY", exposure: "PUBLIC" },
          { id: "comp-2", name: "Auth & SSO Service", type: "CORE_SERVICE", exposure: "PRIVATE" },
          { id: "comp-3", name: "Multi-Tenant PostgreSQL", type: "DATA_STORE", exposure: "ISOLATED" },
          { id: "comp-4", name: "Redis Event Stream", type: "MESSAGE_BUS", exposure: "PRIVATE" },
          { id: "comp-5", name: "Autonomous Worker Fleet", type: "CORE_SERVICE", exposure: "PRIVATE" },
        ],
      },
      kubernetes_infrastructure: {
        name: "Kubernetes Sovereign Container Mesh",
        description: "Production Kubernetes cluster with Ingress Controller, Pod-to-Pod Wireguard Service Mesh, and Secrets Vault.",
        components: [
          { id: "k8s-1", name: "NGINX Ingress Controller", type: "API_GATEWAY", exposure: "PUBLIC" },
          { id: "k8s-2", name: "SageAI Core Pod Fleet", type: "CORE_SERVICE", exposure: "PRIVATE" },
          { id: "k8s-3", name: "HashiCorp Vault / KMS", type: "DATA_STORE", exposure: "ISOLATED" },
          { id: "k8s-4", name: "eBPF Kernel Monitor", type: "EDGE_SERVICE", exposure: "PRIVATE" },
        ],
      },
    },
  };
}

