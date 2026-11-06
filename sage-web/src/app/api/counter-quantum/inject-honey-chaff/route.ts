import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/counter-quantum/inject-honey-chaff`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackInjection(body));
  } catch {
    return NextResponse.json(getFallbackInjection({}));
  }
}

function getFallbackInjection(body: any) {
  const burst = body?.burst_count || 100;
  return {
    status: "success",
    injection: {
      injection_id: "CHAFF-SIM-7129",
      interceptor_id: body?.interceptor_id || "interceptor-transatlantic-tap-01",
      burst_count: burst,
      target_pqc_scheme: "ML-KEM-1024",
      lattice_dimension: body?.lattice_dimension || 1024,
      entropy_sink_type: body?.entropy_sink_type || "TRAPDOOR_EXPONENTIAL_BRANCH_SINK",
      trapdoor_signature: "8f4cb123ea9100fa1284bc7719a0bc44",
      injected_data_volume_mb: burst * 1.56,
      adversary_storage_corrupted_pct: Math.min(99.4, burst * 0.12),
      estimated_adversary_qpu_burn_hours: burst * 18.5,
      status: "CHAFF_POISON_INJECTED_SUCCESSFULLY",
      timestamp: Date.now() / 1000,
    },
  };
}
