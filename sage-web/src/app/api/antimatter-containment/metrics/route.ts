import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_containment_cells: 3,
    total_antiprotons_stored: 2670000000,
    equivalent_annihilation_energy_joules: 0.803,
    mean_magnetic_field_tesla: 11.33,
    mean_cryogenic_temp_k: 3.4,
    plasma_mode: "PENNING_MALMBERG_ROTATING_WALL",
    status: "NOMINAL_STABLE",
  });
}

