import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      harvester_id: "DARK-ENERGY-ATACAMA-01",
      facility_name: "Atacama Cosmic Quintessence Subterranean Well",
      latitude: -24.6272,
      longitude: -70.4042,
      altitude_m: 5050.0,
      inflaton_coupling_constant: 1.25e-4,
      equation_of_state_w: -1.02,
      negative_pressure_gpa: -7.85,
      metric_energy_harvest_rate_mw: 520.0,
      field_coherence_pct: 99.85,
      status: "INFLATON_RESONANCE_LOCKED",
    },
    {
      harvester_id: "DARK-ENERGY-MAUNA-KEA-02",
      facility_name: "Mauna Kea Inflaton Metric Stabilizer",
      latitude: 19.8206,
      longitude: -155.4681,
      altitude_m: 4205.0,
      inflaton_coupling_constant: 1.25e-4,
      equation_of_state_w: -1.01,
      negative_pressure_gpa: -6.92,
      metric_energy_harvest_rate_mw: 450.0,
      field_coherence_pct: 99.82,
      status: "INFLATON_RESONANCE_LOCKED",
    },
    {
      harvester_id: "DARK-ENERGY-ORBITAL-LAGRANGE-03",
      facility_name: "Lagrange L2 Cosmic Void Energy Tap",
      latitude: 0.0,
      longitude: 0.0,
      altitude_m: 448900000.0,
      inflaton_coupling_constant: 1.25e-4,
      equation_of_state_w: -1.04,
      negative_pressure_gpa: -8.45,
      metric_energy_harvest_rate_mw: 680.0,
      field_coherence_pct: 99.94,
      status: "INFLATON_RESONANCE_LOCKED",
    },
  ]);
}

