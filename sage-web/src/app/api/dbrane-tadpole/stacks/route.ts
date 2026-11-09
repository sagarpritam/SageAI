import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      stack_id: "DBRANE-STACK-CY-01",
      geometry_label: "Calabi-Yau T6/Z2 Orientifold D3/D7 Sector",
      d_brane_dimension: 3,
      stack_multiplicity_n: 16,
      ramond_ramond_charge_q: 16,
      orientifold_plane_charge_qo: -16,
      net_tadpole_charge_excess: 2,
      green_schwarz_axion_coupling: 0.084,
      status: "TADPOLE_EXCESS_UNCOMPENSATED",
    },
    {
      stack_id: "DBRANE-STACK-CY-02",
      geometry_label: "Type IIB Compactified CY3 Magnetic Flux Stack",
      d_brane_dimension: 7,
      stack_multiplicity_n: 8,
      ramond_ramond_charge_q: 8,
      orientifold_plane_charge_qo: -8,
      net_tadpole_charge_excess: 1,
      green_schwarz_axion_coupling: 0.125,
      status: "TADPOLE_EXCESS_UNCOMPENSATED",
    },
    {
      stack_id: "DBRANE-STACK-CY-03",
      geometry_label: "Heterotic M-Theory Horava-Witten Boundary Orbifold",
      d_brane_dimension: 9,
      stack_multiplicity_n: 32,
      ramond_ramond_charge_q: 32,
      orientifold_plane_charge_qo: -32,
      net_tadpole_charge_excess: 3,
      green_schwarz_axion_coupling: 0.240,
      status: "TADPOLE_EXCESS_UNCOMPENSATED",
    },
  ]);
}

