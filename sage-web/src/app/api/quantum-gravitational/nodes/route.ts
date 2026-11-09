import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      node_id: "QGRAV-NODE-GENEVA-01",
      facility_name: "CERN Deep Quantum Vacuum Tunnel",
      latitude: 46.2044,
      longitude: 6.1432,
      altitude_m: 375.0,
      condensate_atom_type: "Rb-87",
      trap_temperature_nk: 55.0,
      interferometer_baseline_m: 12.0,
      gravity_gradient_sensitivity_eotvos: 1e-18,
      holographic_entropy_nats: 4.2e28,
      status: "INTERFEROMETER_PHASE_LOCKED",
    },
    {
      node_id: "QGRAV-NODE-CHEYENNE-02",
      facility_name: "Cheyenne Subterranean Cryo-Lab",
      latitude: 38.7439,
      longitude: -104.8475,
      altitude_m: 1950.0,
      condensate_atom_type: "Rb-87",
      trap_temperature_nk: 60.0,
      interferometer_baseline_m: 10.0,
      gravity_gradient_sensitivity_eotvos: 1e-18,
      holographic_entropy_nats: 4.2e28,
      status: "INTERFEROMETER_PHASE_LOCKED",
    },
    {
      node_id: "QGRAV-NODE-ORBITAL-L1-03",
      facility_name: "Lagrange L1 Spacetime Observatory",
      latitude: 0.0,
      longitude: 0.0,
      altitude_m: 326400000.0,
      condensate_atom_type: "Rb-87",
      trap_temperature_nk: 12.0,
      interferometer_baseline_m: 50.0,
      gravity_gradient_sensitivity_eotvos: 1e-18,
      holographic_entropy_nats: 4.2e28,
      status: "INTERFEROMETER_PHASE_LOCKED",
    },
  ]);
}

