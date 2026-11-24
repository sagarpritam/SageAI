import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/gravitational-wave-interferometer/telemetry", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Gravitational Wave Interferometer telemetry:", err);
    return NextResponse.json({
      interferometer_id: "GWIS-LISA-DECIGO-DEEPSPACE-01",
      arm_length_km: 2500000.0,
      strain_sensitivity_h_per_sqrt_hz: 1.0e-21,
      carrier_wavelength_nm: 1064.0,
      heterodyne_frequency_mhz: 25.0,
      laser_phase_noise_rejection_db: -118.5,
      inter_satellite_optical_throughput_pbps: 1500.0,
      topological_optical_coherence_percent: 99.99997,
      status: "INTERFEROMETRIC_PHASE_LOCK_ACTIVE",
      active_constellation_arms: 4,
    });
  }
}
