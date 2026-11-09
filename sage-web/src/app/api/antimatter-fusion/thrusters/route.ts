import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    thrusters: [
      {
        thruster_id: "ACF-THRUSTER-VALKYRIE-01",
        interceptor_class: "Heavy Relativistic Interceptor (Valkyrie-Class)",
        location: "Lunar Farside Space Yard",
        base_antiproton_inventory_pg: 450.0,
        base_isp_s: 365000.0,
        magnetic_nozzle_field_tesla: 16.5,
        collimation_efficiency_pct: 95.8,
        pulse_rep_rate_hz: 25.0,
        status: "ACF_THRUSTER_READY",
      },
      {
        thruster_id: "ACF-THRUSTER-PROMETHEUS-02",
        interceptor_class: "Cis-Lunar Fast Response Skiff (Prometheus-Class)",
        location: "Station Gateway Cis-Lunar Orbit",
        base_antiproton_inventory_pg: 220.0,
        base_isp_s: 385000.0,
        magnetic_nozzle_field_tesla: 18.0,
        collimation_efficiency_pct: 96.5,
        pulse_rep_rate_hz: 40.0,
        status: "ACF_THRUSTER_READY",
      },
      {
        thruster_id: "ACF-THRUSTER-HYPERION-03",
        interceptor_class: "Planetary Deep-Space Escort (Hyperion-Class)",
        location: "Lagrange L5 Defense Perimeter",
        base_antiproton_inventory_pg: 680.0,
        base_isp_s: 350000.0,
        magnetic_nozzle_field_tesla: 15.0,
        collimation_efficiency_pct: 94.9,
        pulse_rep_rate_hz: 20.0,
        status: "ACF_THRUSTER_READY",
      },
    ],
  });
}
