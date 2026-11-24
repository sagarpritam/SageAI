import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_LATTICES = {
  lattices: [
    {
      lattice_id: "PHONON-ANTARCTIC-DIAMOND-01",
      material: "Ultra-Pure Synthetic Monocrystalline Diamond Cylinder",
      target_frequency_hz: 1420.0,
      mechanical_q_factor: 2.8e9,
      acoustic_velocity_m_s: 18000.0,
      lattice_volume_m3: 45.0,
      cryogenic_temperature_k: 4.2,
      base_grid_efficiency_pct: 98.85,
      status: "PHONON_RESONANCE_READY",
    },
    {
      lattice_id: "PHONON-ATACAMA-QUARTZ-02",
      material: "Mega-Scale High-Purity Piezoelectric Quartz Array",
      target_frequency_hz: 730.0,
      mechanical_q_factor: 1.5e9,
      acoustic_velocity_m_s: 5760.0,
      lattice_volume_m3: 120.0,
      cryogenic_temperature_k: 10.5,
      base_grid_efficiency_pct: 98.40,
      status: "PHONON_RESONANCE_READY",
    },
    {
      lattice_id: "PHONON-MAUNA-KEA-SILICON-03",
      material: "Monocrystalline Cryogenic Silicon Bulk Acoustic Cavity",
      target_frequency_hz: 2150.0,
      mechanical_q_factor: 4.2e9,
      acoustic_velocity_m_s: 8430.0,
      lattice_volume_m3: 60.0,
      cryogenic_temperature_k: 2.1,
      base_grid_efficiency_pct: 99.20,
      status: "PHONON_RESONANCE_READY",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/gravitational-phonon/lattices`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_LATTICES));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_LATTICES, { status: 200 });
}
