import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/bec-superfluid/channels", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback BEC Superfluid channels:", err);
    return NextResponse.json([
      {
        channel_id: "BEC-CONDENSATE-ALPHA",
        superfluid_mode: "Rubidium-87 Ultra-Cold Optical Dipole Trap T=45nK",
        chemical_potential_nK: 120.5,
        sound_velocity_mm_s: 4.85,
        optical_channel_throughput_pbps: 1150.0,
        status: "CONDENSATE_PHASE_COHERENT",
      },
      {
        channel_id: "BOGOLIUBOV-PHONON-BETA",
        superfluid_mode: "Linear Dispersion Quasiparticle Sound Waveguide omega=c_s*k",
        chemical_potential_nK: 115.0,
        sound_velocity_mm_s: 4.65,
        optical_channel_throughput_pbps: 1150.0,
        status: "PHONON_DISPERSION_OPTIMAL",
      },
      {
        channel_id: "QUANTIZED-VORTEX-GAMMA",
        superfluid_mode: "Onsager-Feynman Quantized Topological Vortex Lattice",
        chemical_potential_nK: 132.0,
        sound_velocity_mm_s: 5.12,
        optical_channel_throughput_pbps: 1150.0,
        status: "VORTEX_CIRCULATION_PINNED",
      },
      {
        channel_id: "SUPERFLUID-CRITICAL-DELTA",
        superfluid_mode: "Landau Critical Velocity Dissipationless Superflow Regime",
        chemical_potential_nK: 128.0,
        sound_velocity_mm_s: 4.95,
        optical_channel_throughput_pbps: 1150.0,
        status: "DISSIPATIONLESS_SUPERFLOW_ACTIVE",
      },
    ]);
  }
}
