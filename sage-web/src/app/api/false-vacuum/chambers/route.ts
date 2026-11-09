import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      chamber_id: "VACUUM-SHIELD-GENEVA-01",
      facility_name: "CERN Higgs Vacuum Tunneling Stabilizer Enclave",
      higgs_field_vev_gev: 246.22,
      tunneling_barrier_height_gev4: 1.52e9,
      coleman_de_luccia_bounce_action_b: 1865.0,
      critical_bubble_radius_am: 480.0,
      vacuum_decay_rate_log10: -292.0,
      counter_bias_pulse_power_tw: 48.0,
      status: "METASTABLE_VACUUM_LOCKED",
    },
    {
      chamber_id: "VACUUM-SHIELD-FERMILAB-02",
      facility_name: "Fermilab Deep Subterranean Electroweak Vacuum Rig",
      higgs_field_vev_gev: 246.22,
      tunneling_barrier_height_gev4: 1.45e9,
      coleman_de_luccia_bounce_action_b: 1820.0,
      critical_bubble_radius_am: 430.0,
      vacuum_decay_rate_log10: -281.0,
      counter_bias_pulse_power_tw: 42.0,
      status: "METASTABLE_VACUUM_LOCKED",
    },
    {
      chamber_id: "VACUUM-SHIELD-ORBITAL-03",
      facility_name: "High-Earth Orbit Clean Vacuum Shield Satellite",
      higgs_field_vev_gev: 246.22,
      tunneling_barrier_height_gev4: 1.65e9,
      coleman_de_luccia_bounce_action_b: 1910.0,
      critical_bubble_radius_am: 520.0,
      vacuum_decay_rate_log10: -305.0,
      counter_bias_pulse_power_tw: 64.0,
      status: "METASTABLE_VACUUM_LOCKED",
    },
  ]);
}

