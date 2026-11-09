import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    traps: [
      {
        trap_id: "MONOPOLE-TRAP-ICELAND-01",
        location: "Subterranean Geothermal Monopole Basin (Reykjanes Vault)",
        monopoles_confined_count: 48,
        magnetic_confinement_tesla: 32.5,
        base_proton_feed_mg_s: 1.25,
        conversion_efficiency_pct: 89.4,
        decay_rate_per_sec: 7.5e18,
        status: "MONOPOLE_TRAP_CONFINED_OPTIMAL",
      },
      {
        trap_id: "MONOPOLE-TRAP-GENEVA-02",
        location: "Deep-Crustal LHC Monopole Well (Geneva Enclave)",
        monopoles_confined_count: 64,
        magnetic_confinement_tesla: 35.0,
        base_proton_feed_mg_s: 1.60,
        conversion_efficiency_pct: 91.2,
        decay_rate_per_sec: 9.6e18,
        status: "MONOPOLE_TRAP_CONFINED_OPTIMAL",
      },
      {
        trap_id: "MONOPOLE-TRAP-ORBITAL-03",
        location: "Planetary Shield Toroidal Station (Sun-Earth L1)",
        monopoles_confined_count: 32,
        magnetic_confinement_tesla: 28.0,
        base_proton_feed_mg_s: 0.95,
        conversion_efficiency_pct: 88.0,
        decay_rate_per_sec: 5.2e18,
        status: "MONOPOLE_TRAP_CONFINED_OPTIMAL",
      },
    ],
  });
}

