import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeOptionalJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

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

    const res = await fetch(`${BACKEND}/photonic-quantum/evaluate-lattice`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await safeUpstreamJson(res, fallbackEvaluation(body));
      return NextResponse.json(data);
    }
    return NextResponse.json(fallbackEvaluation(body));
  } catch {
    return NextResponse.json(fallbackEvaluation(body));
  }
}

function fallbackEvaluation(body: any) {
  const isThreat = (body.root_hermite_factor || 1.0045) < 1.0035;
  return {
    status: "success",
    evaluation: {
      evaluation_id: "q-eval-simulated",
      coprocessor_id: body.coprocessor_id || "photonic-borealis-cvq-01",
      threat_detected: isThreat,
      threat_type: isThreat ? "PHOTONIC_SVP_LATTICE_REDUCTION_EXPLOIT" : "NOMINAL_LATTICE_QUANTUM_HARDNESS",
      target_pqc_scheme: body.target_pqc_scheme || "ML-KEM-1024",
      lattice_dimension: body.lattice_dimension || 1024,
      root_hermite_factor: body.root_hermite_factor || 1.0045,
      photon_loss_rate_pct: body.photon_loss_rate_pct || 1.2,
      estimated_classical_bit_security: 256,
      optical_gate_latency_fs: 115.0,
      action_recommended: isThreat ? "ENGAGE_PHOTONIC_OPTICAL_NOISE_FIREWALL" : "CONTINUE_POST_QUANTUM_COMMUNICATION",
      timestamp: Date.now() / 1000,
    },
  };
}

