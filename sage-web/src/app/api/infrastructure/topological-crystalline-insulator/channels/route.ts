import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/topological-crystalline-insulator/channels", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Topological Crystalline Insulator channels:", err);
    return NextResponse.json([
      {
        channel_id: "SNTE-SURFACE-001",
        material_phase: "Stoichiometric Tin Telluride (SnTe) {001}",
        dirac_velocity_km_s: 520.0,
        mirror_symmetry_plane: "M_110_REFLECTION",
        surface_band_gap_mev: 0.0,
        optical_channel_throughput_pbps: 600.0,
        status: "UNPINNED_SURFACE_DIRAC_ACTIVE",
      },
      {
        channel_id: "PB1X-SNX-TE-110",
        material_phase: "Lead Tin Telluride Alloy (Pb0.6Sn0.4Te) {110}",
        dirac_velocity_km_s: 495.0,
        mirror_symmetry_plane: "M_001_REFLECTION",
        surface_band_gap_mev: 0.0,
        optical_channel_throughput_pbps: 600.0,
        status: "DUAL_VALLEY_CONE_COHERENT",
      },
      {
        channel_id: "PBSE-TOPOLOGICAL-VALLEY",
        material_phase: "Strained Lead Selenide (PbSe) Epitaxial Film",
        dirac_velocity_km_s: 510.0,
        mirror_symmetry_plane: "M_1-10_REFLECTION",
        surface_band_gap_mev: 0.0,
        optical_channel_throughput_pbps: 600.0,
        status: "VALLEY_FILTERED_STREAMING",
      },
      {
        channel_id: "MIRROR-CHERN-M2-CRYSTAL",
        material_phase: "Topological Heterostructure SnTe/CdTe Superlattice",
        dirac_velocity_km_s: 535.0,
        mirror_symmetry_plane: "M_XY_COMPLEX_REFLECTION",
        surface_band_gap_mev: 0.0,
        optical_channel_throughput_pbps: 600.0,
        status: "MIRROR_CHERN_PROTECTED",
      },
    ]);
  }
}
