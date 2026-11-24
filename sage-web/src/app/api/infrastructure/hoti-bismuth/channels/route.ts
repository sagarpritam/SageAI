import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/hoti-bismuth/channels", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback HOTI Bismuth channels:", err);
    return NextResponse.json([
      {
        channel_id: "BISMUTH-HINGE-01",
        hoti_manifold: "1D Chiral Bismuth Hinge State",
        hinge_decay_length_angstrom: 12.5,
        quantized_quadrupole_qxy: 0.5,
        optical_channel_throughput_pbps: 650.0,
        status: "HELICAL_HINGE_ACTIVE",
      },
      {
        channel_id: "BI4BR4-CORNER-02",
        hoti_manifold: "0D Bi4Br4 Fractionalized Corner Mode",
        hinge_decay_length_angstrom: 8.4,
        quantized_quadrupole_qxy: 0.5,
        optical_channel_throughput_pbps: 650.0,
        status: "CORNER_STATE_LOCALIZED",
      },
      {
        channel_id: "QUADRUPOLE-FRACTIONAL-03",
        hoti_manifold: "Benalcazar-Bernevig-Hughes (BBH) Quantized Quadrupole",
        hinge_decay_length_angstrom: 10.2,
        quantized_quadrupole_qxy: 0.5,
        optical_channel_throughput_pbps: 650.0,
        status: "QUADRUPOLE_TOPOLOGY_LOCKED",
      },
      {
        channel_id: "OCTUPOLE-3D-HOTI-04",
        hoti_manifold: "3D Octupolar Higher-Order Insulator",
        hinge_decay_length_angstrom: 14.1,
        quantized_quadrupole_qxy: 0.5,
        optical_channel_throughput_pbps: 650.0,
        status: "OCTUPOLE_CORNER_COHERENT",
      },
    ]);
  }
}
