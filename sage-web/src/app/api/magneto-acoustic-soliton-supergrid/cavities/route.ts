import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_CAVITIES = {
  cavities: [
    {
      cavity_id: "SOLITON-PACIFIC-RIM-01",
      location: "Pacific Rim Deep Borehole Transduction Grid",
      resonant_frequency_hz: 0.042,
      cmb_depth_km: 2891.0,
      nominal_magnetic_field_tesla: 0.005,
      acoustic_velocity_km_s: 13.6,
      base_grid_efficiency_pct: 99.42,
      status: "SOLITON_RESONANCE_READY",
    },
    {
      cavity_id: "SOLITON-AFRICAN-SUPERPLUME-02",
      location: "African LLSVP Core-Mantle Acoustic Waveguide",
      resonant_frequency_hz: 0.028,
      cmb_depth_km: 2905.0,
      nominal_magnetic_field_tesla: 0.008,
      acoustic_velocity_km_s: 12.8,
      base_grid_efficiency_pct: 99.55,
      status: "SOLITON_RESONANCE_READY",
    },
    {
      cavity_id: "SOLITON-NORDIC-CRATON-03",
      location: "Fennoscandian Craton Deep Crustal Piezoelectric Vault",
      resonant_frequency_hz: 0.065,
      cmb_depth_km: 2880.0,
      nominal_magnetic_field_tesla: 0.004,
      acoustic_velocity_km_s: 14.1,
      base_grid_efficiency_pct: 99.38,
      status: "SOLITON_RESONANCE_READY",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/magneto-acoustic-soliton-supergrid/cavities`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_CAVITIES));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_CAVITIES, { status: 200 });
}
