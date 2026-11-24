import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/lsm-spinon-bus/channels", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback LSM Spinon channels:", err);
  }

  return NextResponse.json([
    {
      channel_id: "LSM-SPINON-EXCITATION-ALPHA",
      channel_name: "LSM Fractionalized Spinon Chain Mode",
      spin_quantum_number: 0.5,
      spinon_momentum_k_rad: 1.5708,
      fermi_velocity_m_s: 1420000.0,
      channel_throughput_pbps: 1350.0,
      luttinger_parameter_k: 1.000,
      status: "FRACTIONAL_SPINON_PROPAGATING",
    },
    {
      channel_id: "HOLON-SPINON-SEPARATION-BETA",
      channel_name: "Spin-Charge Separation Waveguide Mode",
      spin_quantum_number: 0.5,
      spinon_momentum_k_rad: 3.1416,
      fermi_velocity_m_s: 1450000.0,
      channel_throughput_pbps: 1350.0,
      luttinger_parameter_k: 0.985,
      status: "SPIN_CHARGE_DECOUPLED",
    },
    {
      channel_id: "TOPOLOGICAL-ENTANGLEMENT-GAMMA",
      channel_name: "Entanglement Entropy Gapless Branch",
      spin_quantum_number: 0.5,
      spinon_momentum_k_rad: 0.7854,
      fermi_velocity_m_s: 1390000.0,
      channel_throughput_pbps: 1350.0,
      luttinger_parameter_k: 1.015,
      status: "GAPLESS_ENTANGLEMENT_BRANCH",
    },
    {
      channel_id: "DIMERIZED-VALENCE-BOND-DELTA",
      channel_name: "Valence Bond Solid (VBS) Resonating Core",
      spin_quantum_number: 0.5,
      spinon_momentum_k_rad: 2.3562,
      fermi_velocity_m_s: 1410000.0,
      channel_throughput_pbps: 1350.0,
      luttinger_parameter_k: 0.995,
      status: "RESONATING_VBS_LOCKED",
    },
  ]);
}
