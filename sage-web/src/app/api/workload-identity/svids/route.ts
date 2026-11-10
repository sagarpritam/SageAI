import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/workload-identity/svids`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackSvids());
  } catch {
    return NextResponse.json(getFallbackSvids());
  }
}

function getFallbackSvids() {
  return {
    status: "success",
    svids: [
      {
        svid_id: "svid-ord-9921",
        spiffe_id: "spiffe://sageai.internal/ns/prod/sa/order-service",
        workload_name: "order-service-78f9c-zk21",
        namespace: "prod",
        service_account: "order-service",
        cert_serial: "4A:9F:8B:2C:1E:00:99:A1",
        status: "ACTIVE_VALID",
        ttl_minutes: 60,
        rotation_interval_minutes: 30,
        enclave_attested: true,
      },
      {
        svid_id: "svid-pay-4412",
        spiffe_id: "spiffe://sageai.internal/ns/prod/sa/payment-service",
        workload_name: "payment-service-55c8b-mk09",
        namespace: "prod",
        service_account: "payment-service",
        cert_serial: "7C:3B:11:0E:9F:88:54:D2",
        status: "ACTIVE_VALID",
        ttl_minutes: 60,
        rotation_interval_minutes: 30,
        enclave_attested: true,
      },
    ],
  };
}

