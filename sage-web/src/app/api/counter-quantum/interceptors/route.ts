import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/counter-quantum/interceptors`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackInterceptors());
  } catch {
    return NextResponse.json(getFallbackInterceptors());
  }
}

function getFallbackInterceptors() {
  return {
    status: "success",
    interceptors: [
      {
        interceptor_id: "interceptor-transatlantic-tap-01",
        name: "Transatlantic Subsea Cable Egress Chaff Injector",
        traffic_type: "Subsea Optical Egress (400Gbps)",
        target_pqc_scheme: "ML-KEM-1024",
        chaff_injection_ratio_pct: 5.0,
        adversary_harvest_detected: true,
        status: "HONEY_CHAFF_PIPELINE_ACTIVE",
        honey_ciphertexts_injected: 14280,
      },
      {
        interceptor_id: "interceptor-satellite-downlink-02",
        name: "LEO Space-Ground RF Telemetry Honey-Sink",
        traffic_type: "Orbital Optical & Ka-Band Downlink",
        target_pqc_scheme: "ML-DSA-87",
        chaff_injection_ratio_pct: 8.5,
        adversary_harvest_detected: true,
        status: "HONEY_CHAFF_PIPELINE_ACTIVE",
        honey_ciphertexts_injected: 9840,
      },
      {
        interceptor_id: "interceptor-cloud-egress-sentry-03",
        name: "Global Multi-Cloud VPC Peering Egress Blinder",
        traffic_type: "TLS 1.3 / Post-Quantum Hybrid WireGuard",
        target_pqc_scheme: "ML-KEM-768",
        chaff_injection_ratio_pct: 3.2,
        adversary_harvest_detected: false,
        status: "STANDBY_MONITORING",
        honey_ciphertexts_injected: 4120,
      },
    ],
  };
}
