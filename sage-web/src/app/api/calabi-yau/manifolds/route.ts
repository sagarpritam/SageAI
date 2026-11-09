import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      manifold_id: "CY3-QUINTIC-P4-01",
      geometry_name: "Fermat Quintic Threefold in P4",
      hodge_number_h11: 1,
      hodge_number_h21: 101,
      euler_characteristic: -200,
      string_coupling_gs: 0.182,
      compactification_volume_string_units: 48.5,
      flux_superpotential_w0: 1.28e-3,
      anti_d3_uplift_energy_gev: 8.6e15,
      moduli_stability_status: "MODULI_KKLT_MINIMUM_LOCKED",
    },
    {
      manifold_id: "CY3-BICUBIC-P2XP2-02",
      geometry_name: "Bicubic Hypersurface in P2 x P2",
      hodge_number_h11: 2,
      hodge_number_h21: 83,
      euler_characteristic: -162,
      string_coupling_gs: 0.175,
      compactification_volume_string_units: 52.1,
      flux_superpotential_w0: 1.15e-3,
      anti_d3_uplift_energy_gev: 7.9e15,
      moduli_stability_status: "MODULI_KKLT_MINIMUM_LOCKED",
    },
    {
      manifold_id: "CY3-MIRROR-TIAN-YAU-03",
      geometry_name: "Tian-Yau Complete Intersection Calabi-Yau",
      hodge_number_h11: 14,
      hodge_number_h21: 23,
      euler_characteristic: -18,
      string_coupling_gs: 0.194,
      compactification_volume_string_units: 64.0,
      flux_superpotential_w0: 1.42e-3,
      anti_d3_uplift_energy_gev: 9.2e15,
      moduli_stability_status: "MODULI_KKLT_MINIMUM_LOCKED",
    },
  ]);
}
