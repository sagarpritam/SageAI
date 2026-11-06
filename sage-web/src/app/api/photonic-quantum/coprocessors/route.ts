import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/photonic-quantum/coprocessors`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackCoprocessors());
  } catch {
    return NextResponse.json(getFallbackCoprocessors());
  }
}

function getFallbackCoprocessors() {
  return {
    status: "success",
    coprocessors: [
      {
        coprocessor_id: "photonic-borealis-cvq-01",
        name: "Borealis CV Photonic Quantum Co-Processor",
        architecture: "Continuous-Variable Squeezed Light Interferometer",
        optical_modes: 216,
        squeezing_factor_db: 1.85,
        optical_gate_latency_fs: 115.0,
        status: "OPTICAL_COHERENCE_STABLE",
        mzi_interferometer_elements: 1280,
        cryogenic_cooling_kelvin: 4.2,
        cryptanalytic_attempts_blocked: 0,
      },
      {
        coprocessor_id: "photonic-mzi-mesh-silicon-02",
        name: "Nanophotonic Silicon Mach-Zehnder Mesh Array",
        architecture: "Integrated Silicon Nitride (Si3N4) Programmable MZI Mesh",
        optical_modes: 64,
        squeezing_factor_db: 2.10,
        optical_gate_latency_fs: 98.0,
        status: "OPTICAL_COHERENCE_STABLE",
        mzi_interferometer_elements: 512,
        cryogenic_cooling_kelvin: 293.15,
        cryptanalytic_attempts_blocked: 0,
      },
      {
        coprocessor_id: "photonic-quandela-quantum-03",
        name: "Quandela Quantum Dot Optical Cryptanalytic Unit",
        architecture: "Single-Photon Deterministic Emitter Array",
        optical_modes: 36,
        squeezing_factor_db: 1.45,
        optical_gate_latency_fs: 140.0,
        status: "OPTICAL_COHERENCE_STABLE",
        mzi_interferometer_elements: 256,
        cryogenic_cooling_kelvin: 3.8,
        cryptanalytic_attempts_blocked: 0,
      },
    ],
  };
}

