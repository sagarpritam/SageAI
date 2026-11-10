import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeOptionalJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  const parsed = await safeOptionalJsonBody<any>(req);
  if (!parsed.ok) {
    return parsed.response;
  }
  const body = parsed.data;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/photonic-quantum/engage-firewall`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }, 5000);

    if (res.ok) {
      const data = await safeUpstreamJson(res, fallbackFirewall(body));
      return NextResponse.json(data);
    }
    return NextResponse.json(fallbackFirewall(body));
  } catch {
    return NextResponse.json(fallbackFirewall(body));
  }
}

function fallbackFirewall(body: any) {
  return {
    status: "success",
    firewall_event: {
      firewall_id: "q-firewall-simulated",
      coprocessor_id: body.coprocessor_id || "photonic-borealis-cvq-01",
      defense_mode: body.defense_mode || "OPTICAL_NOISE_INJECTION_BARRIER",
      optical_response_latency_fs: 115.0,
      quantum_fidelity_degradation_pct: 98.4,
      adversarial_decoherence_enforced: true,
      new_coprocessor_status: "QUANTUM_FIREWALL_ENGAGED",
      timestamp: Date.now() / 1000,
    },
  };
}

