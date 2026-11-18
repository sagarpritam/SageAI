import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_QUBITS = {
  qubits: [
    {
      qubit_id: "CRYO-FLUX-15MK-01",
      classification: "Millikelvin Mixing Chamber 3-Junction Superconducting Flux Qubit",
      base_temperature_mk: 14.8,
      josephson_energy_ej_ghz: 48.5,
      charging_energy_ec_ghz: 1.25,
      base_coherence_t1_us: 85.4,
      base_clamping_db: 164.2,
      status: "DILUTION_FRIDGE_BASE_COLD",
    },
    {
      qubit_id: "CRYO-FLUX-TRANSMON-02",
      classification: "Fluxonium / Heavy Flux Qubit Microwave Cavity Enclave",
      base_temperature_mk: 18.2,
      josephson_energy_ej_ghz: 12.4,
      charging_energy_ec_ghz: 0.85,
      base_coherence_t1_us: 142.0,
      base_clamping_db: 169.8,
      status: "DILUTION_FRIDGE_BASE_COLD",
    },
    {
      qubit_id: "CRYO-FLUX-COPLANAR-03",
      classification: "Coplanar Waveguide 4K Buffer & Quantum Phase Slip Barrier",
      base_temperature_mk: 22.5,
      josephson_energy_ej_ghz: 65.0,
      charging_energy_ec_ghz: 2.10,
      base_coherence_t1_us: 62.5,
      base_clamping_db: 173.5,
      status: "DILUTION_FRIDGE_BASE_COLD",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/cryogenic-flux-qubit/qubits`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_QUBITS));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_QUBITS);
}

