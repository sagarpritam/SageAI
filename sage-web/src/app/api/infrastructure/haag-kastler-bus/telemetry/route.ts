import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/haag-kastler-bus/telemetry", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Haag-Kastler telemetry:", err);
  }

  return NextResponse.json({
    bus_id: "HAAG-KASTLER-BUS-01",
    bus_name: "Haag-Kastler Axiomatic Algebraic Quantum Field Theory Net Interconnect Bus",
    status: "OPERATIONAL",
    optical_bus_throughput_pbps: 6200.0,
    microcausality_fidelity: 0.99999999,
    causal_split_gap_gev: 1.25,
    superluminal_dissipation_nw: 0.0,
    active_haag_channels: 4,
    timestamp: new Date().toISOString(),
  });
}
