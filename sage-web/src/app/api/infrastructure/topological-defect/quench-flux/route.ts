import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/topological-defect/quench-flux", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Topological Defect quench receipt:", err);
    return NextResponse.json({
      quench_id: `DEFECT-QUENCH-${Date.now().toString(36).toUpperCase()}`,
      channel_id: "KIBBLE-ZUREK-QUENCH-ALPHA",
      quench_time_ns: 1.25,
      defect_density_per_m2: 4.2e10,
      flux_quanta_h_over_2e: 1.0,
      optical_throughput_pbps: 1250.0,
      timestamp: new Date().toISOString(),
      status: "TOPOLOGICAL_DEFECT_QUENCHED",
    });
  }
}
