import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/atomic-clock/clocks`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackClocks());
  } catch {
    return NextResponse.json(getFallbackClocks());
  }
}

function getFallbackClocks() {
  return {
    status: "success",
    clocks: [
      {
        clock_id: "clock-strontium-boulder-01",
        name: "NIST Boulder Cryogenic Strontium-87 Optical Lattice Primary Standard",
        atomic_species: "Strontium-87 (87Sr)",
        transition_frequency_thz: 429.228,
        fractional_uncertainty: 1.4e-18,
        operating_temp_kelvin: 0.000001,
        comb_link_active: true,
        status: "ATOMIC_LATTICE_LOCK_NOMINAL",
        drift_offset_fs: 0.12,
        timestamps_authenticated: 142050,
      },
      {
        clock_id: "clock-ytterbium-ptb-02",
        name: "PTB Braunschweig Ytterbium-171 Optical Lattice Frequency Disseminator",
        atomic_species: "Ytterbium-171 (171Yb)",
        transition_frequency_thz: 518.295,
        fractional_uncertainty: 1.6e-18,
        operating_temp_kelvin: 0.000002,
        comb_link_active: true,
        status: "ATOMIC_LATTICE_LOCK_NOMINAL",
        drift_offset_fs: 0.18,
        timestamps_authenticated: 118420,
      },
      {
        clock_id: "clock-strontium-tokyo-03",
        name: "RIKEN Tokyo Space-Time Relativistic Geodesy Lattice Clock",
        atomic_species: "Strontium-87 (87Sr)",
        transition_frequency_thz: 429.228,
        fractional_uncertainty: 1.5e-18,
        operating_temp_kelvin: 0.000001,
        comb_link_active: true,
        status: "ATOMIC_LATTICE_LOCK_NOMINAL",
        drift_offset_fs: 0.14,
        timestamps_authenticated: 98910,
      },
      {
        clock_id: "clock-cesium-fountain-ref-04",
        name: "Paris Observatory Primary Fountain Microwave Backup",
        atomic_species: "Cesium-133 (133Cs)",
        transition_frequency_thz: 0.009192,
        fractional_uncertainty: 1.2e-16,
        operating_temp_kelvin: 0.00001,
        comb_link_active: false,
        status: "MICROWAVE_REFERENCE_ONLINE",
        drift_offset_fs: 14.5,
        timestamps_authenticated: 45210,
      },
    ],
  };
}
